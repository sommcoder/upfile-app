// node modules:
import { createWriteStream, type ReadStream } from "node:fs";
import { Readable } from "node:stream";
import { access, mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";

// external dependency:
import Busboy from "busboy";

// types:
import { type ActionFunction } from "@remix-run/node";
import { type Collection } from "mongodb";

// local modules:
import { authenticate, db } from "app/shopify.server";
import type { BBFile, MerchantStore } from "app/types";
import { settings } from "app/data/merchant-settings";
import { isThrottled } from "app/util/rateLimiting";
import { WritableStream } from "node:stream/web";

// Ensure the uploads directory exists
const UPLOAD_DIR = "./app/uploads";
await mkdir(UPLOAD_DIR, { recursive: true });

// TODO: Block executable files on the client too!
// ! Prevent double extensions (evil.js.png can trick users into thinking it's an image).
interface validFileTypes {
  [mimeType: string]: string;
}

// db check:
try {
  if (!db) {
    // maybe we should TRY to reconnect before throwing an Error
    throw new Error("No valid database connection");
  }
} catch (error) {
  if (error instanceof Error) {
    console.log("proxy.file msg:", error.message);
  } else {
    console.log("proxy.file error:", error);
  }
}

// Entrypoint
export const action: ActionFunction = async ({ request }) => {
  try {
    // console.log("request:", request);
    if (!request || !request.body) {
      return new Response("Invalid request", { status: 400 });
    }

    const { session } = await authenticate.public.appProxy(request);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const storeId = session.id;
    const storeDomain = session.shop;
    const clientIp = request.headers.get("x-shopify-client-ip");
    console.log("clientIp:", clientIp);

    // some middleware checks:
    if (!storeId || !storeDomain) {
      return new Response("Invalid session", { status: 400 });
    }

    if (!clientIp) {
      return new Response("Undefined client IP address", { status: 400 });
    }

    // ! route middleware
    // just on file route so far. maybe more in the future..?
    // check throttling for the IP making the request
    if (await isThrottled(clientIp)) {
      return new Response("Too many requests per minute", { status: 429 });
    }

    // Our "controller":
    switch (request.method) {
      case "POST":
        // TODO: we should also GET the Content-Length header coming in to check the request size. immediately reject it if it's OVER the merchants maxRequestSize setting
        return handleCreate(request, storeId);
      case "DELETE":
        return handleDelete(request, storeId);
      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log("action entry msg:", error.message);
    } else {
      console.log("action entry error:", error);
    }
  }
};

// add/create file(s):
export function handleCreate(request: Request, storeId: string) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!request || !request.body) return null;

      const contentType = request.headers.get("content-type") || "";

      // ! convert the Web ReadableStream to a Node ReadableStream
      const readableStream = Readable.toWeb(Readable.from(request.body));

      const bb = Busboy({ headers: { "content-type": contentType } });
      const fileUploads: Promise<{ filename: string; id: string }>[] = [];

      const fileUUIDs: string[] = [];

      bb.on("field", (fieldname, value) => {
        if (fieldname === "file_uuid") {
          if (!value) {
            console.warn("file_uuid Check: No UUID provided for file!");
            return;
          }
          console.log("value:", value);

          fileUUIDs.push(value);
        }
        console.log("POST fileUUIDs:", fileUUIDs);
      });

      bb.on(
        "file",
        (name: string, file: ReadStream, { filename, mimeType }: BBFile) => {
          let extension: string =
            settings.validFileTypes[
              mimeType as keyof typeof settings.validFileTypes
            ] || path.extname(filename);

          // Extra security:
          if (settings.forbiddenFileTypes.includes(extension)) {
            return new Error(`File type not allowed: ${extension}`);
          }

          // Get the first UUID from the array
          const fileUUID = fileUUIDs[0]; // Access the first element from the array
          console.log("fileUUID:", fileUUID);
          // Remove the first UUID from the array
          fileUUIDs.shift(); // This ensures the UUID is only used once

          const uniqueFilename = `${fileUUID}.${extension}`;
          const saveTo = path.join(UPLOAD_DIR, uniqueFilename);

          const writeStream = createWriteStream(saveTo);
          file.pipe(writeStream); // Stream file to disk

          let fileSize = 0;
          let requestSize = 0; // accumulate the size of each file.

          // Monitor file size and handle exceeding max size
          bb.on("data", (chunk: any) => {
            fileSize += chunk.length;

            if (fileSize > +settings.maxFileSize) {
              console.warn(`File too large: ${filename}`);
              file.unpipe(writeStream);
              writeStream.destroy();
              file.resume();
            }
            requestSize += fileSize;

            if (requestSize > +settings.maxRequestSize) {
              console.warn(`Request is too large: ${filename}`);
              file.unpipe(writeStream);
              writeStream.destroy();
              file.resume();
            }
          });

          const filePromise = new Promise<{
            filename: string;
            id: string;
            status: string;
          }>((resolveFile, rejectFile) => {
            file.on("end", () => {
              // On success, update the array with the UUID status
              resolveFile({ filename, id: fileUUID, status: "success" });
            });
            file.on("error", () => {
              // On failure, update the array with the UUID status
              rejectFile(new Error("File upload failed"));
            });
          });

          fileUploads.push(filePromise);
        },
      );

      bb.on("finish", async () => {
        try {
          const uploadResults = await Promise.allSettled(fileUploads);

          if (process.env.NODE_ENV === "production") {
            const successfulUploads = uploadResults
              .filter((res) => res.status === "fulfilled")
              .map(
                (res) =>
                  (
                    res as PromiseFulfilledResult<{
                      id: string;
                      filename: string;
                    }>
                  ).value,
              );

            if (successfulUploads.length > 0 && db) {
              const collection = db.collection<MerchantStore>("stores");
              await collection.updateOne(
                { _id: storeId },
                {
                  $push: {
                    files: {
                      $each: successfulUploads.map(({ id, filename }) => ({
                        _id: id,
                        filename,
                        storeId,
                        uploadedAt: new Date().toISOString(),
                        lineItemId: null,
                        orderId: null,
                      })),
                    },
                  },
                },
                { upsert: true },
              );
            }
          }

          resolve(
            new Response(JSON.stringify(uploadResults), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          );
        } catch (uploadError) {
          reject(new Response("Error processing files", { status: 500 }));
        }
      });

      // Pipe the converted stream into busboy
      readableStream.pipeTo(
        new WritableStream({
          write: (chunk) => bb.write(chunk),
          close: () => bb.end(),
        }) as WritableStream<any>,
      );
    } catch (error) {
      console.error("Upload error:", error);
      reject(new Response("Server error", { status: 500 }));
    }
  });
}

// deletes file(s):
// just send the file(s) to delete.
// TODO: might be smart to have a DELETE/CLEAR ALL on the UI, otherwise we're gunna have to handle MULTIPLE delete requests vs one.
export async function handleDelete(request: Request, storeId: string) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response("Unsupported content type", { status: 415 });
    }

    const data = await request.json();

    console.log("DELETE data:", data);
    if (!Array.isArray(data) || data.length === 0) {
      return new Response("No file UUIDs provided", { status: 400 });
    }

    // issue here
    let filesToDelete: string[] = [];

    if (process.env.NODE_ENV === "production") {
      const collection: Collection<MerchantStore> | undefined =
        db?.collection("stores");

      if (!collection) {
        return new Response("Database connection error", { status: 500 });
      }

      // Fetch file details from DB
      const store = await collection.findOne(
        { _id: storeId },
        { projection: { files: 1 } },
      );
      if (!store || !store.files) {
        return new Response("Store not found or no files exist", {
          status: 404,
        });
      }

      // Filter files that match the UUIDs
      filesToDelete = store.files.filter((file: any) =>
        data.includes(file._id),
      );

      if (filesToDelete.length === 0) {
        return new Response("No matching files found", { status: 404 });
      }

      // Remove files from DB
      const updateResult = await collection.updateOne(
        { _id: storeId },
        { $pull: { files: { _id: { $in: data } } } },
      );

      console.log("DB update result:", updateResult);
    } else {
      // If not in production, filesToDelete just deletes locally!
      filesToDelete = data;
    }

    console.log("filesToDelete:", filesToDelete);

    const result = await Promise.allSettled(
      filesToDelete.map(async (fileId) => {
        try {
          const filename = await findFileByUUID(fileId);
          console.log("filename:", filename);
          if (!filename) {
            throw new Error(`File with UUID ${fileId} not found`);
          }

          const filePath = path.join(UPLOAD_DIR, filename);
          console.log("Deleting file:", filePath);

          await access(filePath);
          await unlink(filePath);

          return filename;
        } catch (error) {
          console.warn(`Failed to delete fileId: ${fileId}`, error);
          throw error;
        }
      }),
    );

    console.log("result:", result);

    const failedDeletions = result.filter(
      (file) => file.status !== "fulfilled",
    );

    return new Response(JSON.stringify(failedDeletions), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("handleDelete error:", error);
    return new Response("Server error", { status: 500 });
  }
}

async function findFileByUUID(uuid: string) {
  const files = await readdir(UPLOAD_DIR); // List all files
  return files.find((file) => file.startsWith(uuid)); // Find matching filename
}

// GET requests
export const loader: ActionFunction = async ({ request }) => {
  try {
    return new Response("Method Not Allowed", { status: 405 });
  } catch (error) {
    if (error instanceof Error) {
      console.log("loader entry GET msg:", error.message);
    } else {
      console.log("loader entry GET error:", error);
    }
  }
};
