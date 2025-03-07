// node modules:
import { createWriteStream, type ReadStream } from "node:fs";
import { Readable } from "node:stream";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import * as settings from "app/data/merchant-settings.json";

// external dependency
import Busboy from "busboy";

import { type ActionFunction } from "@remix-run/node";
import { type Collection } from "mongodb";

import { authenticate, db } from "app/shopify.server";
import type { BBFile, MerchantStore } from "app/types";
import { isThrottled } from "app/util/rateLimiting";
import { WritableStream } from "node:stream/web";

// Ensure the uploads directory exists
const UPLOAD_DIR = "./app/uploads";
await mkdir(UPLOAD_DIR, { recursive: true });

// TODO: Block executable files on the client too!
// ! Prevent double extensions (evil.js.png can trick users into thinking it's an image).

// Type for settings.permittedFileTypes
interface PermittedFileTypes {
  [mimeType: string]: string; // mime type is a string, extension is also a string
}

// Type for your settings
interface Settings {
  permittedFileTypes: PermittedFileTypes;
  maxFileSize: number; // Assuming this is a number (bytes)
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
    console.log("request:", request);
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
      return new Response("Could not determine IP of client", { status: 400 });
    }

    // just on file route so far. maybe more in the future..?
    if (await isThrottled(clientIp)) {
      return new Response("Too many requests per minute", { status: 429 });
    }

    // Our "controller":
    switch (request.method) {
      case "POST":
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
          fileUUIDs.push(value);
        }
        console.log("fileUUIDs:", fileUUIDs);
      });

      bb.on(
        "file",
        (name: string, file: ReadStream, { filename, mimeType }: BBFile) => {
          let extension: string =
            settings.permittedFileTypes[
              mimeType as keyof typeof settings.permittedFileTypes
            ] || path.extname(filename);

          // Get the first UUID from the array
          const fileUUID = fileUUIDs[0]; // Access the first element from the array

          // Remove the first UUID from the array
          fileUUIDs.shift(); // This ensures the UUID is only used once

          const uniqueFilename = `${fileUUID}.${extension}`;
          const saveTo = path.join(UPLOAD_DIR, uniqueFilename);

          const writeStream = createWriteStream(saveTo);
          file.pipe(writeStream); // Stream file to disk

          let fileSize = 0;

          // Monitor file size and handle exceeding max size
          bb.on("data", (chunk) => {
            fileSize += chunk.length;

            if (fileSize > +settings.maxFileSize) {
              console.warn(`File too large: ${filename}`);
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
          const uploadedFiles = await Promise.all(fileUploads);
          console.log("Uploads complete:", uploadedFiles);

          const collection: Collection<MerchantStore> | undefined =
            db?.collection<MerchantStore>("stores");
          if (!collection) return;

          const updatedFileFields = uploadedFiles.map(({ id, filename }) => ({
            _id: id,
            filename: filename,
            storeId: storeId,
            uploadedAt: new Date().toISOString(),
            lineItemId: null,
            orderId: null,
          }));

          if (process.env.NODE_ENV === "production") {
            const storeResult = await collection.updateOne(
              { _id: storeId },
              { $push: { files: { $each: updatedFileFields } } },
              { upsert: true },
            );
            console.log("storeResult:", storeResult);
          }

          resolve(
            new Response(
              JSON.stringify({ success: true, files: uploadedFiles }),
              { status: 200 },
            ),
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
// might be smart to have a DELETE/CLEAR ALL on the UI, otherwise we're gunna have to handle MULTIPLE delete requests vs one.
export function handleDelete(request: Request, storeId: string) {
  try {
    // deletes all of the files with the UUID in the request. Needs to handle ONE or MORE file UUIDs coming from the client.
    // ! we're just using the UUID to 'lookup'/read the file to delete it in /uploads as well as the DB/storage.
  } catch (error) {
    if (error instanceof Error) {
      console.log("handleDelete msg:", error.message);
    } else {
      console.log("handleDelete error:", error);
    }
  }
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
