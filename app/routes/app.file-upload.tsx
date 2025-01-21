import { type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

// form-data-parser is a wrapper around request.formData() that provides s549239 bytes to mbcorstreaming support for handling file uploads

import {
  MultipartParseError,
  parseMultipartRequest,
} from "@mjackson/multipart-parser";
import { LocalFileStorage } from "@mjackson/file-storage/local";
import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
// this is our proxy which will then make a call to the

// const fileStorage = new LocalFileStorage("./app/file-uploads");
// const storageKey = `files`;

async function fileHandler(fileUpload: FileUpload) {
  console.log("fileUpload:", fileUpload);

  if (fileUpload.fieldName === "files") {
    // process the upload and return a File
    console.log("fileUpload:", fileUpload);
  }

  const stream = fileUpload.stream();

  console.log("stream:", stream);
  // Return a File for the FormData object. This is a LazyFile that knows how
  // to access the file's content if needed (using e.g. file.stream()) but
  // waits until it is requested to actually read anything.
  // return fileStorage.get(storageKey);
}

export async function action({ request }: ActionFunctionArgs) {
  // the request REACH us!
  // ERROR: something about reading url as undefined
  // console.log("---------------- hit app proxy ---------");
  // console.log("request:", request);
  // console.log("request.headers:", request.headers);
  try {
    const { session } = await authenticate.public.appProxy(request);

    const formData = await parseFormData(request, fileHandler);
    // let formData = await request.formData();
    // const files = formData.get("files");

    // console.log("files:", files);

    // let formData = await parseFormData(request, fileHandler);
    // console.log("formData:", formData);

    // let file = formData.get("files"); // File
    // console.log("file:", file);
    // // console.log("file.name:", file.name);
    // // console.log("file.size:", file.size);
    // // console.log("file.type:", file.type);

    return "We got the file(s)!";
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
