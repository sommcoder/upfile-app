import { type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

// form-data-parser is a wrapper around request.formData() that provides streaming support for handling file uploads

import {
  MultipartParseError,
  parseMultipartRequest,
} from "@mjackson/multipart-parser";

// this is our proxy which will then make a call to the
export async function action({ request }: ActionFunctionArgs) {
  // the request REACH us!
  // ERROR: something about reading url as undefined
  console.log("---------------- hit app proxy ---------");
  console.log("req:", request);
  try {
    const { session } = await authenticate.public.appProxy(request);
    if (session) {
      console.log("session:", session); // should contain access token
    }

    // The parser `yield`s each MultipartPart as it becomes available
    for await (let part of parseMultipartRequest(request)) {
      console.log(part.name);
      console.log(part.filename);

      if (!part.mediaType) return;

      if (/^text\//.test(part.mediaType)) {
        console.log(await part.text());
      } else {
        // TODO: part.body is a ReadableStream<Uint8Array>, stream it to a file

        // handle the pdf by taking a screenshot of it so that it may be displayed in the order details page
        if (part.mediaType === "application/pdf") {
          try {
            // ! PDF-Poppler operates on file paths and so you need to save the stream to a temporary file first.
            // maybe Remix has a library for this, but if not we can just use the os module i think..?
            const { pdfToPNG } = await import("pdf-poppler");

            let newBuffer = (await pdfToPNG(buffer)) as Buffer;
            if (newBuffer) buffer = newBuffer;
          } catch (error) {
            if (error instanceof Error) {
              console.log("pdf Check msg:", error.message);
            } else {
              console.log("pdf Check error:", error);
            }
          }
        }
      }
    }

    return "we got it!";
  } catch (error) {
    if (error instanceof Error) {
      console.log("file-upload action msg:", error.message);
    } else {
      console.log("file-upload action error:", error);
    }
    return null;
  }

  // get the formData from the req.body

  // make a call to our DB, pass session.shop to link the file contents to the right merchant
  // admin?.graphql(`

  // `)

  // get the UUID from the DB
}
