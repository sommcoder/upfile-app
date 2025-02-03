import {
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
  UploadHandler,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { randomUUID } from "node:crypto";
import { authenticate, db } from "app/shopify.server";
import { LocalFileStorage } from "@mjackson/file-storage/local";
import { Readable, Writable } from "node:stream";
import fs from "node:fs";
import Busboy from "busboy";
import path from "node:path";

const fileStorage = new LocalFileStorage(
  await fsp.mkdtemp(path.join(os.tmpdir(), "form-data-parser-")),
);

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { session } = await authenticate.public.appProxy(request);

    if (!session) return new Response("Unauthorized", { status: 401 });

    const storeId = session._id?.toHexString();
    const storeURL = session.shop;
    if (!storeId || !storeURL)
      return new Response("Invalid session", { status: 400 });

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response("Invalid request", { status: 400 });
    }
  } catch (error) {
    console.error("File upload action error:", error);
    return new Response("Error uploading files", { status: 500 });
  }
}
