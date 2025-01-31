// form-data-parser is a wrapper around request.formData() that provides s549239 bytes to mbcorstreaming support for handling file uploads
// import {
//   MultipartParseError,
//   parseMultipartRequest,
// } from "@mjackson/multipart-parser";
// import { LocalFileStorage } from "@mjackson/file-storage/local";
// import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";

import { type ActionFunctionArgs } from "@remix-run/node";
import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import { authenticate, db } from "app/shopify.server";
import { parseMultipartRequest } from "@mjackson/multipart-parser";

const stores = db?.collection("stores");
// this is our proxy which will then make a call to the

// const fileStorage = new LocalFileStorage("./app/file-uploads");
// const storageKey = `files`;

// async function fileHandler(fileUpload: FileUpload) {
//   console.log("fileUpload:", fileUpload);

//   if (fileUpload.fieldName === "files") {
//     // process the upload and return a File
//     console.log("fileUpload:", fileUpload);
//   }

//   const stream = fileUpload.stream();

//   console.log("stream:", stream);
//   // Return a File for the FormData object. This is a LazyFile that knows how
//   // to access the file's content if needed (using e.g. file.stream()) but
//   // waits until it is requested to actually read anything.
//   // return fileStorage.get(storageKey);
// }

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { session } = await authenticate.public.appProxy(request);
    if (!session) return null;

    const storeId = session._id?.toHexString();
    const storeURL = session.shop;

    if (!storeId) return null;

    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.startsWith("multipart/form-data")) {
      return new Response("Invalid content type", { status: 400 });
    }

    // Directory for temporary storage
    const tempDir = path.join(os.tmpdir(), "uploads");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Read the stream directly from request.body
    const reader = request.body?.getReader();
    if (!reader) {
      return new Response("Unable to read stream", { status: 500 });
    }

    // Initialize an array to store file metadata
    const uploadedFiles: any[] = [];

    // Process the form data and save each file
    // ! this is that
    const formDataParser = parseMultipartRequest(request); // Parsing the multipart request
    for await (const part of formDataParser) {
      if (part.type === "file" && part.file) {
        // For each file, create a new unique ID
        const fileId = randomUUID();
        const tempFilePath = path.join(tempDir, `upload-${fileId}`);

        // Create a file stream to write to
        const fileStream = fs.createWriteStream(tempFilePath);

        // Stream the file content directly to disk
        const fileReader = part.file.stream().getReader();
        let done = false;
        while (!done) {
          const { value, done: isDone } = await fileReader.read();
          if (value) {
            fileStream.write(value); // Write the chunk to the file
          }
          done = isDone;
        }

        // Close the file stream after writing is done
        fileStream.end();

        // Store file metadata in the array
        uploadedFiles.push({
          fileId,
          filename: part.filename,
          storagePath: tempFilePath,
          uploadedAt: new Date(),
        });
      }
    }

    // Now that all files are processed, store metadata in MongoDB
    await stores?.updateOne(
      { _id: storeId },
      {
        $set: { name: storeURL },
        $push: { files: { $each: uploadedFiles } },
      },
      { upsert: true },
    );

    return new Response(
      JSON.stringify({
        message: "Files uploaded successfully",
        files: uploadedFiles,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("File upload action error:", error);
    return new Response("Error uploading files", { status: 500 });
  }
}
