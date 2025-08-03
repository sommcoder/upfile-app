import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

// import handleRequest from "app/entry.server";
import { authenticate } from "../shopify.server";
import { EnvContext } from "app/context/envcontext";
import { convertNodeFieldsToObj } from "app/hooks/convertNodeFieldsToObj";
import { useEffect } from "react";
import Footer from "app/components/FooterHelp/FooterHelp";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// ! in memory cache:
// so resets on server restart and WON'T persist across distributed instances
// if using cloud run or some sort of serverless implementation this might provide SOME performance boost but will be unreliable and we'd be at the mercy of the cloud service
const shopSettingsCache = new Map<string, any>(); // key = shop domain

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  console.log("/app loader - session:", session);

  if (shopSettingsCache.has(shop)) {
    return {
      apiKey: process.env.SHOPIFY_API_KEY || "",
      themeBlockId: process.env.SHOPIFY_THEME_APP_EXTENSION_ID,
      shopSettings: shopSettingsCache.get(shop),
    };
  }

  // Now I want to GET the shop settings metaobject instance and store it to use across the app
  // TODO: should optimize this at some point but running it on each load AND page load should be fine for low traffic
  const query = /* GraphQL*/ `
    query GetShopSettings {
      metaobjects(first: 1, type: "upfile-shop-settings", reverse: true) {
          nodes {
            id
            type
            handle
            fields {
              key
              jsonValue
              type
            }
          }
        }
    }
  `;

  const response = await admin.graphql(query);
  const raw = await response.json();
  const shopSettings = convertNodeFieldsToObj(raw.data.metaobjects.nodes[0]);
  // console.log("shopSetings:", shopSettings);
  // ✅ Cache it
  shopSettingsCache.set(shop, shopSettings);

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    themeBlockId: process.env.SHOPIFY_THEME_APP_EXTENSION_ID,
    shopSettings,
  };
};

export const action = async () => {
  return null;
};

export default function App() {
  const { apiKey, themeBlockId, shopSettings } = useLoaderData<typeof loader>();

  if (!themeBlockId) {
    throw new Error("App() : embedAppId is not accessible");
  }

  // TODO: this could PROBABLY be optimized
  useEffect(() => {
    // add the shopSettings to sessionStorage on each load
    sessionStorage.setItem("shopSettings", JSON.stringify(shopSettings));
  }, [shopSettings]);

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <EnvContext.Provider value={{ themeBlockId, apiKey, shopSettings }}>
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
        <Footer />
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
