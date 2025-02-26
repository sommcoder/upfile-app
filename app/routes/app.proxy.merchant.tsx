<<<<<<< HEAD
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
=======
import { type LoaderFunction } from "@remix-run/node";
>>>>>>> 53ddc082e2d164108c4a698ef2d7729ec52b09fc
// import type { MerchantStore } from "app/types";
// import { type Collection } from "mongodb";

import { authenticate, db } from "app/shopify.server";

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

<<<<<<< HEAD
export const action: ActionFunction = async ({ request }) => {
  try {
    console.log("merchant action request:", request);
    return null;
  } catch (error) {
    if (error instanceof Error) {
      console.log("action msg:", error.message);
    } else {
      console.log("action error:", error);
    }
  }
};

=======
>>>>>>> 53ddc082e2d164108c4a698ef2d7729ec52b09fc
// loads the merchant settings for the theme app block
export const loader: LoaderFunction = async ({ request }) => {
  if (!request || !request.body) return null;

<<<<<<< HEAD
  console.log("merchant loader request:", request);
=======
  console.log("request:", request);
>>>>>>> 53ddc082e2d164108c4a698ef2d7729ec52b09fc

  const { session } = await authenticate.public.appProxy(request);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const storeId = session.id;
  console.log("storeId:", storeId);

  // const collection: Collection<MerchantStore> =
  //   db.collection<MerchantStore>("stores");
  // if (!collection) return;

  // const merchant = await collection.findOne(
  //   { shop: storeId }, // Filter criteria
  //   { projection: { settings: 1, _id: 0 } }, // Projection: Include `settings`, exclude `_id`
  // );

  // GET requests go here!
  return new Response(
    JSON.stringify({
      fileTypeMap: {
        "application/acad": ".dwg",
        "image/x-dwg": ".dwg",
        "image/x-dxf": ".dxf",
        "drawing/x-dwf": ".dwf",
        "model/iges": ".iges",
        "model/step": ".step",
        "model/stl": ".stl",
        "model/3mf": ".3mf",
        "model/gltf+json": ".gltf",
        "model/gltf-binary": ".glb",
        "model/obj": ".obj",
        "model/vnd.collada+xml": ".dae",
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "image/svg+xml": ".svg",
        "image/webp": ".webp",
        "image/bmp": ".bmp",
        "image/tiff": ".tiff",
        "text/plain": ".txt",
        "text/css": ".css",
        "application/sla": ".sla",
        "application/x-amf": ".amf",
        "application/x-gcode": ".gcode",
        "application/pdf": ".pdf",
        "application/json": ".json",
        "application/xml": ".xml",
        "application/zip": ".zip",
        "application/x-tar": ".tar",
        "application/gzip": ".gz",
        "application/x-7z-compressed": ".7z",
        "application/x-rar-compressed": ".rar",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          ".docx",
        "application/vnd.ms-excel": ".xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          ".xlsx",
        "application/vnd.ms-powerpoint": ".ppt",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          ".pptx",
        "audio/mpeg": ".mp3",
        "audio/ogg": ".ogg",
        "video/mp4": ".mp4",
        "video/x-msvideo": ".avi",
        "video/webm": ".webm",
        "application/x-font-ttf": ".ttf",
        "application/x-font-otf": ".otf",
        "application/vnd.ms-fontobject": ".eot",
        "application/x-font-woff": ".woff",
        "application/x-font-woff2": ".woff2",
        "application/x-apple-diskimage": ".dmg",
        "application/mac-binhex40": ".hqx",
        "application/x-apple-property-list": ".plist",
      },
    }),
    { status: 200 },
  );
};

// TODO: we should eventually load this from the DB as this will be custom to the merchant settings:
