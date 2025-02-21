// app/routes/app-proxy/delete-file.tsx (or .ts)

import { type ActionFunction } from "@remix-run/node";
import { db } from "app/shopify.server";

export let action: ActionFunction = async ({ request, params }) => {
  try {
    const { fileId } = params; // Extract fileId from the URL

    if (!fileId) {
      return new Response("File ID is required", { status: 400 });
    }

    // Perform your deletion logic (e.g., remove file from DB or file system)
    const result = await db.files.delete({ where: { id: fileId } });

    if (result) {
      return new Response("File deleted successfully", { status: 200 });
    } else {
      return new Response("File not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return new Response("Server error", { status: 500 });
  }
};
