import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// import handleRequest from "app/entry.server";
import { authenticate } from "../shopify.server";
import { EnvContext } from "app/context/envcontext";
import { logError } from "app/util/logError";
import { createInitAppDefinitions } from "app/transactions/installation";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const dataDefObj = await createInitAppDefinitions(admin);
  console.log("APP INSTALL dataDefObj:", dataDefObj);
  if (!dataDefObj) throw new Error("App Definition Creation Failed");
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    embedAppId: process.env.SHOPIFY_APP_BRIDGE_THEME_BLOCK_ID,
    blockAppId: process.env.SHOPIFY_APP_BRIDGE_THEME_BLOCK_ID,
  };
};

export const action = async () => {
  return null;
};

export default function App() {
  const { apiKey, embedAppId, blockAppId } = useLoaderData<typeof loader>();

  if (!embedAppId) {
    throw new Error("App() : embedAppId is not accessible");
  }
  if (!blockAppId) {
    throw new Error("App() : blockAppId is not accessible");
  }

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <EnvContext.Provider value={{ embedAppId, apiKey, blockAppId }}>
        <NavMenu>
          <Link to="/app" rel="home">
            Home
          </Link>
          <Link to="/app/widgets">Widgets</Link>
          <Link to="/app/files">Files</Link>
          <Link to="/app/products">Products</Link>
          <Link to="/app/plan">Plan</Link>
          <Link to="/app/settings">Settings</Link>
        </NavMenu>
        <Outlet />
      </EnvContext.Provider>
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
