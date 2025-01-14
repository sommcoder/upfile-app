import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import handleRequest from "app/entry.server";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // ensures the app is installed on the current store.
  await authenticate.admin(request);

  console.log("handleRequest:", handleRequest);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  // This is a SPECIAL Component file that enables the encapsulation of our app within the AppProvider and gives us our NavMenu component
  // ! Note that NESTED navigation items are not supported.
  // ! If you need more navigation options than Tabs are available but Shopify advices us to use them sparingly!
  // I believe if we need access to ANOTHER API, we would of course need to change that in our shopify.app.toml file but also authenticate

  /* 
  - navigating to app will render the app._index.tsx file
  */

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/orders">Orders</Link>
        <Link to="/app/files">Files</Link>
        <Link to="/app/products">Products</Link>
        <Link to="/app/settings">Settings</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
