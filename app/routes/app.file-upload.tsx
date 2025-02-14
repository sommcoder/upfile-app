// node modules:
import { createWriteStream, ReadStream } from "node:fs";
import { Readable } from "node:stream";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// external dependency
import Busboy from "busboy";

import { type ActionFunction } from "@remix-run/node";
import { type Collection } from "mongodb";

import { authenticate, db } from "app/shopify.server";

interface FileDetails {
  _id: string; // UUID
  filename: string;
  storeId: string; // references the store the files belong to
  uploadedAt: string;
  // once in cart:
  cartToken: string | null; // the cart the file belongs to
  lineItemId: string | null; // the line item the file belongs to
  // once order placed:
  orderId: string | null; // null until the order comes through
}

// would be easy to just GET the stores data on load
interface MerchantStore {
  _id: string;
  files: FileDetails[];

  // ! all this stuff will be added onInstall
  // storeDomain: string; // the .myshopify.com id
  // shopifyPlan: string;
  // dateCreated: string; // when they installed the app

  // appPlan: string; // our plan tier: free, basic, business, advanced
  // chargeId: string;
  // status: string; // active, pending, cancelled
  // ownerEmail?: string; // can I and should I store this?
}

type BBFile = {
  filename: string;
  encoding: string;
  mimeType: string;
};

// Ensure the uploads directory exists
const UPLOAD_DIR = "./app/uploads";
await mkdir(UPLOAD_DIR, { recursive: true });

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// MIME type to file extension
const mimeMap: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/zip": "zip",
  // Add more if needed
};

export const action: ActionFunction = async ({ request }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { session } = await authenticate.public.appProxy(request);

      if (!session) return new Response("Unauthorized", { status: 401 });

      console.log("session:", session);
      // ! get this info to store file in GCP bucket and file ID in DB
      const storeId = session._id?.toHexString();
      const storeDomain = session.shop;

      if (!storeId || !storeDomain) {
        return new Response("Invalid session", { status: 400 });
      }

      const contentType = request.headers.get("content-type") || "";

      // ! convert the Web ReadableStream to a Node ReadableStream
      const readableStream = Readable.toWeb(Readable.from(request.body));

      const bb = Busboy({ headers: { "content-type": contentType } });
      const fileUploads: Promise<{ filename: string; id: string }>[] = [];

      bb.on(
        "file",
        (name: string, file: ReadStream, { filename, mimeType }: BBFile) => {
          // console.log("name:", name);
          // console.log("filename:", filename);
          // console.log("encoding:", encoding);
          // console.log("mimeType:", mimeType);
          // // console.log("path.extname(filename):", path.extname(filename));
          // console.log(`Processing file: ${filename} (${mimeType})`);
          // console.log("file:", file);

          // Check if we can map the mime type to an extension
          let extension = mimeMap[mimeType] || path.extname(filename); // Use extname if mime type is not found
          // ! should probably also do a conditional check to make sure this particular merchant/store ALLOWS for the submitted MIMETYPE as an extra layer of security besides just client validation.
          console.log("Mapped file extension:", extension);

          // Generate unique filename
          const fileId = randomUUID();
          const uniqueFilename = `${fileId}.${extension}`;
          console.log("uniqueFilename:", uniqueFilename);

          const saveTo = path.join(UPLOAD_DIR, uniqueFilename);

          const writeStream = createWriteStream(saveTo);
          file.pipe(writeStream); // Stream directly to disk

          let fileSize = 0;

          // ! check data size of current stream:
          bb.on("data", (chunk) => {
            fileSize += chunk.length;
            console.log("fileSize:", fileSize);
            if (fileSize > MAX_FILE_SIZE) {
              console.warn(`File too large: ${filename}`);
              file.unpipe(writeStream);
              writeStream.destroy();
              file.resume();
            }
          });

          const filePromise = new Promise<{ filename: string; id: string }>(
            (resolveFile, rejectFile) => {
              file.on("end", () => resolveFile({ filename, id: fileId }));
              file.on("error", rejectFile);
            },
          );

          fileUploads.push(filePromise);
        },
      );

      // bb.on("field", (fieldname, value) => {
      //   console.log("fieldname:", fieldname);
      //   console.log("value:", value);
      //   fields[fieldname] = value;
      // });

      bb.on("finish", async () => {
        try {
          const uploadedFiles = await Promise.all(fileUploads);
          console.log("Uploads complete:", uploadedFiles);

          // Now we add the uploadedFiles to the GCP bucket/or locally in uploads and then just the id to our DB
          if (!db) {
            // Should check this at the top of the script and return error to client and server log
            return;
          }

          const collection: Collection<MerchantStore> =
            db.collection<MerchantStore>("stores");
          console.log("collection:", collection);
          if (!collection) return;

          // // Prepare the update fields
          const updatedFileFields = uploadedFiles.map(({ id, filename }) => {
            return {
              _id: id,
              filename: filename,
              storeId: storeId,
              uploadedAt: new Date().toISOString(),
              cartToken: null,
              lineItemId: null,
              orderId: null,
            };
          });
          console.log("updatedFileFields:", updatedFileFields);

          // ! the store should ALREADY exist
          // store the fields as an array in the store
          // ADDITIONALLY, each file document/object also contains the storeId as a backup. This may be more rigid however will only require one DB query to OUR server to get all the data the app will need on the admin side
          const storeResult = await collection.updateOne(
            { _id: storeId },
            { $push: { files: { $each: updatedFileFields } } },
            { upsert: true },
          );

          // would be great to implement some sort of logging with this
          console.log("storeResult:", storeResult);

          resolve(
            new Response(
              JSON.stringify({ success: true, files: uploadedFiles }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            ),
          );
        } catch (uploadError) {
          reject(new Response("Error processing files", { status: 500 }));
        }
      });

      // Pipe the converted stream into bb
      readableStream.pipeTo(
        new WritableStream({
          write: (chunk) => bb.write(chunk),
          close: () => bb.end(),
        }),
      );
    } catch (error) {
      console.error("Upload error:", error);
      reject(new Response("Server error", { status: 500 }));
    }
  });
};
