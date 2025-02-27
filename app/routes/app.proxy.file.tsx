// node modules:
import { createWriteStream, type ReadStream } from "node:fs";
import { Readable } from "node:stream";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// external dependency
import Busboy from "busboy";

import { type ActionFunction } from "@remix-run/node";
import { type Collection } from "mongodb";

import { authenticate, db } from "app/shopify.server";
import type { BBFile, MerchantStore } from "app/types";

// Ensure the uploads directory exists
const UPLOAD_DIR = "./app/uploads";
await mkdir(UPLOAD_DIR, { recursive: true });

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// !!! Key Concern: A file might not be what it claims to be. A .js file could be uploaded with a fake .jpg extension.
// ! Block executable files (.exe, .bat, .sh, .php, .js, etc.).
// ! Prevent double extensions (evil.js.png can trick users into thinking it's an image).
// TODO: Limit concurrent uploads to prevent abuse. How can we prevent this?
// ! Even if an attacker uploads a .js or .php file, ensure: The server never executes them and The file is treated as raw data, not an executable script.

// TODO: we need to explicitly check for this and block them!
const forbiddenExtensions = [
  ".js",
  ".exe",
  ".bat",
  ".sh",
  ".php",
  ".html",
  ".bin",
];

// MIME type to file extension
// This will eventually be a property on Merchant in the db!
const mimeMap: Record<string, string> = {
  // CAD (Computer-Aided Design) files
  "application/acad": ".dwg", // AutoCAD drawing
  "image/x-dwg": ".dwg", // AutoCAD drawing (alternative MIME type)
  "image/x-dxf": ".dxf", // Drawing Exchange Format
  "drawing/x-dwf": ".dwf", // Design Web Format

  // 3D Model & Printing Files
  "model/iges": ".iges", // IGES format (Initial Graphics Exchange Specification)
  "model/step": ".step", // STEP format (Standard for the Exchange of Product Data)
  "model/stl": ".stl", // Stereolithography file (commonly used in 3D printing)
  "model/3mf": ".3mf", // 3D Manufacturing Format
  "model/gltf+json": ".gltf", // GL Transmission Format (JSON-based)
  "model/gltf-binary": ".glb", // GL Transmission Format (binary)
  "model/obj": ".obj", // Wavefront OBJ file
  "model/vnd.collada+xml": ".dae", // COLLADA format (Digital Asset Exchange)

  // Image Files
  "image/jpeg": ".jpg", // JPEG image
  "image/png": ".png", // PNG image
  "image/gif": ".gif", // GIF image
  "image/svg+xml": ".svg", // Scalable Vector Graphics (SVG)
  "image/webp": ".webp", // WebP image format
  "image/bmp": ".bmp", // Bitmap image
  "image/tiff": ".tiff", // Tagged Image File Format (TIFF)

  // Text & Code Files
  "text/plain": ".txt", // Plain text
  "text/css": ".css", // Cascading Style Sheets (CSS)

  // Application-Specific Files
  "application/sla": ".sla", // Stereolithography
  "application/x-amf": ".amf", // Additive Manufacturing File
  "application/x-gcode": ".gcode", // G-code (3D printer instructions)
  "application/pdf": ".pdf", // Portable Document Format (PDF)
  "application/json": ".json", // JSON (JavaScript Object Notation)
  "application/xml": ".xml", // XML file
  "application/zip": ".zip", // ZIP compressed archive
  "application/x-tar": ".tar", // TAR archive
  "application/gzip": ".gz", // Gzip compressed file
  "application/x-7z-compressed": ".7z", // 7-Zip compressed file
  "application/x-rar-compressed": ".rar", // RAR compressed archive

  // Microsoft Office Files
  "application/msword": ".doc", // Microsoft Word (Legacy format)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx", // Microsoft Word (Modern format)
  "application/vnd.ms-excel": ".xls", // Microsoft Excel (Legacy format)
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx", // Microsoft Excel (Modern format)
  "application/vnd.ms-powerpoint": ".ppt", // Microsoft PowerPoint (Legacy format)
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx", // Microsoft PowerPoint (Modern format)

  // Audio Files
  "audio/mpeg": ".mp3", // MP3 audio
  "audio/ogg": ".ogg", // Ogg Vorbis audio

  // Video Files
  "video/mp4": ".mp4", // MP4 video
  "video/x-msvideo": ".avi", // AVI video
  "video/webm": ".webm", // WebM video

  // Font Files (Windows & Cross-Platform)
  "application/x-font-ttf": ".ttf", // TrueType Font (Windows & macOS)
  "application/x-font-otf": ".otf", // OpenType Font (Windows & macOS)
  "application/vnd.ms-fontobject": ".eot", // Embedded OpenType (used in older Internet Explorer)
  "application/x-font-woff": ".woff", // Web Open Font Format (web-safe)
  "application/x-font-woff2": ".woff2", // Web Open Font Format 2 (improved compression)

  // macOS-Specific Files
  "application/x-apple-diskimage": ".dmg", // macOS Disk Image (installer)
  "application/mac-binhex40": ".hqx", // BinHex-encoded file (legacy encoding format)
  "application/x-apple-property-list": ".plist", // macOS Property List (configuration files)
};

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

    if (!storeId || !storeDomain) {
      return new Response("Invalid session", { status: 400 });
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

      let fileUUID = ""; // Initialize UUID variable

      // ! Testing to see if we can get the UUID
      bb.on("field", (fieldname, value) => {
        if (fieldname === "file_uuid") {
          fileUUID = value; // Capture the UUID from the form field
        }
        console.log("fileUUID:", fileUUID);
      });

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
          // console.log("uniqueFilename:", uniqueFilename);

          const saveTo = path.join(UPLOAD_DIR, uniqueFilename);

          const writeStream = createWriteStream(saveTo);
          file.pipe(writeStream); // Stream directly to disk

          let fileSize = 0;

          // ! check data size of current stream:
          bb.on("data", (chunk) => {
            fileSize += chunk.length;
            // console.log("fileSize:", fileSize);
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

          const collection: Collection<MerchantStore> =
            db.collection<MerchantStore>("stores");

          if (!collection) return;

          // Prepare the update fields for DB:
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
          // console.log("updatedFileFields:", updatedFileFields);

          // ! the store should ALREADY exist
          // store the fields as an array in the store
          // ADDITIONALLY, each file document/object also contains the storeId as a backup. This may be more rigid however will only require one DB query to OUR server to get all the data the app will need on the admin side

          // ! comment out to prevent writing to DB
          // const storeResult = await collection.updateOne(
          //   { _id: storeId },
          //   { $push: { files: { $each: updatedFileFields } } },
          //   { upsert: true },
          // );

          // console.log("storeResult:", storeResult);

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
