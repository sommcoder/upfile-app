import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { getFileSettingsContent } from "app/graphql/theme";
import { fetchDataByGQLBody } from "app/helper/fetchDataByGQLBody";
import { authenticate } from "app/shopify.server";
import { parseSettingsBodyContent } from "app/transactions/themeFileSearch";

// If a route DOESN'T export a default component, it can be used as a resource route!
// Notice that it has no component: that makes it a Resource Route.

/*
 
! It’s imperative that you use reloadDocument on any Links to Resource Routes

There's a subtle detail to be aware of when linking to resource routes. You need to link to it with <Link reloadDocument> or a plain <a href>. If you link to it with a normal <Link to="pdf"> without reloadDocument, then the resource route will be treated as a UI route. Remix will try to get the data with fetch and render the component. Don't sweat it too much, you'll get a helpful error message if you make this mistake.
 
*/
export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  if (!session) throw new Response("Unauthorized", { status: 401 });

  // console.log("THEME FILES RES ROUTE: request:", request);

  const url = new URL(request.url);
  // console.log("url:", url);
  const themeId = url.searchParams.get("theme");
  const fileName = url.searchParams.get("file");
  // console.log("themeId:", themeId);
  // console.log("fileName:", fileName);

  if (!fileName || !themeId) {
    return new Response(JSON.stringify({ error: "Missing file or theme" }), {
      status: 400,
    });
  }
  // pass the filename and mainTheme in a form which we use in the below function

  const {
    theme: {
      files: {
        nodes: [
          {
            body: { content },
          },
        ],
      },
    },
  } = await fetchDataByGQLBody(
    admin,
    getFileSettingsContent(themeId, fileName),
  );

  const blocksArr = parseSettingsBodyContent(content);

  return new Response(JSON.stringify(blocksArr));
}

export async function action() {
  return null;
}
