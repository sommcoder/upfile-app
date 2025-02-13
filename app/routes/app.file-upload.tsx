import { createWriteStream, ReadStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Busboy from "busboy";
import { type ActionFunction } from "@remix-run/node";
import { Readable } from "node:stream";
import { authenticate, db } from "app/shopify.server";
import { Collection, ObjectId } from "mongodb";

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

interface FileDetails {
  _id: string; // UUID
  filename: string;
  storeId: string;
  uploadedAt: string;
}

interface MerchantStore {
  _id: string;
  storeName: string;
  dateCreated: string;
  // id of file and the value is the filename
  files: FileDetails[];
}

// interface MerchantOrders {}

export const action: ActionFunction = async ({ request }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { session } = await authenticate.public.appProxy(request);

      if (!session) return new Response("Unauthorized", { status: 401 });

      // ! get this info to store file in GCP bucket and file ID in DB
      const storeId = session._id?.toHexString();
      const storeURL = session.shop;

      if (!storeId || !storeURL) {
        return new Response("Invalid session", { status: 400 });
      }

      const contentType = request.headers.get("content-type") || "";

      // ! convert the Web ReadableStream to a Node ReadableStream
      const readableStream = Readable.toWeb(Readable.from(request.body));

      const bb = Busboy({ headers: { "content-type": contentType } });
      const fileUploads: Promise<{ filename: string; id: string }>[] = [];

      bb.on(
        "file",
        (
          name: string,
          file: ReadStream,
          {
            filename,
            encoding,
            mimeType,
          }: { filename: string; encoding: string; mimeType: string },
        ) => {
          console.log("name:", name);
          console.log("filename:", filename);
          console.log("encoding:", encoding);
          console.log("mimeType:", mimeType);
          // console.log("path.extname(filename):", path.extname(filename));
          console.log(`Processing file: ${filename} (${mimeType})`);
          console.log("file:", file);

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

          const filesWithIds = uploadedFiles.map(({ filename, id }) => ({
            _id: id, // Extracts the UUID from filename
            filename: filename,
            storeId,
            uploadedAt: new Date().toISOString(),
          }));

          if (!db) {
            // should check this at the top of the script
            return;
          }

          const collection: Collection<MerchantStore> =
            db.collection<MerchantStore>("stores");

          if (!collection) return;

          // Prepare the update fields
          const updateFields = uploadedFiles.reduce(
            (acc, { id, filename }) => {
              acc[id] = { filename, uploadedAt: new Date().toISOString() };
              return acc;
            },
            {} as Record<string, FileDetails>,
          ); // Ensure type is FileDetails for correct structure

          console.log("updateFields:", updateFields);

          // Update the store document with new files
          await collection.updateOne(
            { _id: storeId },
            { $set: { files: updateFields } },
          );

          // Insert all file documents into a separate 'files' collection
          const filesCollection: Collection<FileDetails> =
            db.collection<FileDetails>("files");

          // Insert files with their individual details
          await filesCollection.insertMany(
            uploadedFiles.map(({ id, filename }) => ({
              _id: id, // Use the file ID (UUID)
              filename,
              storeId, // Store reference
              uploadedAt: new Date().toISOString(),
            })),
          );

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
