// ! need the node adapter
import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { type Db, MongoClient, ServerApiVersion } from "mongodb";

export const URI = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_USER_PASS}@${process.env.MONGO_DB_CLUSTER}.zi3yx.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.MONGO_DB_CLUSTER}`;
console.log("URI:", URI);

declare global {
  var mongo: MongoClient;
}

async function run() {
  try {
    const MONGO_CLIENT = new MongoClient(URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    // Connect the client to the server	(optional starting in v4.7)
    await MONGO_CLIENT.connect();
    // Send a ping to confirm a successful connection
    await MONGO_CLIENT.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    global.mongo = MONGO_CLIENT;

    // return the db instance:
    const db = MONGO_CLIENT.db(process.env.MONGO_DB_CLUSTER);
    if (!db) {
      throw new Error("Failed to connect to the database");
    }
    // console.log("db:", db);
    return db as Db;
  } catch (error) {
    if (error instanceof Error) {
      console.log("db run() msg:", error.message);
    } else {
      console.log("db run() error:", error);
    }
  }
}

export const db = await run();

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new MongoDBSessionStorage(
    new URL(URI) as URL,
    process.env.MONGO_DB_CLUSTER as string,
  ),

  distribution: AppDistribution.AppStore,
  isEmbeddedApp: true,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

// console.log("shopify:", shopify);
export default shopify;
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
