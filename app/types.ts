export interface FileDetails {
  _id: string; // UUID
  filename: string;
  storeId: string; // references the store the files belong to
  uploadedAt: string;
  lineItemId: string | null; // the line item the file belongs to
  // once order placed:
  orderId: string | null; // null until the order comes through
}

// would be easy to just GET the stores data on load
export interface MerchantStore {
  _id: string;
  files: FileDetails[];
  permittedFiles: {
    [key: string]: string;
  };

  // ! all this stuff will be added onInstall
  // storeDomain: string; // the .myshopify.com id
  // shopifyPlan: string;
  // dateCreated: string; // when they installed the app

  // appPlan: string; // our plan tier: free, basic, business, advanced
  // chargeId: string;
  // status: string; // active, pending, cancelled
  // ownerEmail?: string; // can I and should I store this?
}

export type BBFile = {
  filename: string;
  encoding: string;
  mimeType: string;
};

export interface Merchant {
  _id: string;
}
