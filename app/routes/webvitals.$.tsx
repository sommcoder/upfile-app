import type { ActionFunction, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  /*
 
TODO: need to figure out how to get a script tag into the <head> of my iframe
 
*/

  try {
    return null;
  } catch (error) {
    if (error instanceof Error) {
      console.log("Web Vitals msg:", error.message);
    } else {
      console.log("Web Vitals error:", error);
    }
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    return null;
  } catch (error) {
    if (error instanceof Error) {
      console.log("Web Vitals msg:", error.message);
    } else {
      console.log("Web Vitals error:", error);
    }
  }
};
