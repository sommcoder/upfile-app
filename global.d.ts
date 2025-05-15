// global.d.ts
declare module "*.css";
declare module "fake-tag";

declare global {
  interface Window {
    upfile: UpfileAppBridge;
  }

  // Define the MerchantSettings interface globally if it's used elsewhere
  interface MerchantData {
    settings: MerchantSettings;
    accessToken: string | null;
  }

  interface MerchantSettings {
    // file related:
    multiFileSubmissionEnabled: boolean | null;
    permittedFileTypes: Record<string, string> | null;
    forbiddenFileTypes: [".js", ".exe", ".bat", ".sh", ".php", ".html", ".bin"];
    maxFileSize: number | null;
    maxRequestSize: number | null;
    maxFileCount: number | null;

    // ui related:
    // mandatory:
    appBridgeEnabled: boolean; // just the embed/logic
    // block:
    blockExtensionEnabled: boolean;
    blockLocation: string[] | null; // product, cart
    // embed:
    injectionType: "cart-drawer" | "app";
    injectionSelector: string | null; // css selector of parent
    injectionSiblingSelector: string | null;
    injectionPosition: string | null; // "beforeend" for: Element.insertBefore();

    // Advanced customization:
    customHTML: string;
    customJS: string;
    customCSS: string;
  }

  interface SessionState {
    errorMessages: string[];
    fileNameSet: Set<string>;
    fileViewerUIMap: Map<string, HTMLElement>;
    fileStateObj: Record<string, FileState>;
    totalStateFileSize: number;
    formData: FormData;
    cart: Cart | null;
  }

  type FileStatus = "success" | "failed" | "fulfilled" | null;

  interface FileState {
    id: string;
    name: string;
    size: number;
    type: string;
    status: FileStatus;
  }

  interface FileDetails {
    _id: string; // UUID
    filename: string;
    storeId: string; // references the store the files belong to
    uploadedAt: string;
    lineItemId: string | null; // the line item the file belongs to
    // once order placed:
    orderId: string | null; // null until the order comes through
  }

  // would be easy to just GET the stores data on load
  interface MerchantStore {
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

  type BBFile = {
    filename: string;
    encoding: string;
    mimeType: string;
  };

  interface Merchant {
    _id: string;
  }

  interface BlockInjection {
    parentSelector: string;
    embedInjectionLocation: string;
  }

  interface PostFileResponse {
    data: UploadedFile[] | null;
    status?: string;
    error?: string;
  }

  interface DeleteFileResponse {
    id: string;
    status: "rejected";
    reason?: string;
  }

  interface DeleteFilesResult {
    failed: DeleteFileResponse[]; // only failed ones
    error?: string;
  }

  interface FileData {
    value: { id: string };
    status: FileStatus;
  }

  interface FileViewerRowElement extends HTMLElement {
    dataset: DOMStringMap;
  }
}

export {}; // Ensures this file is treated as a module to apply the global declaration
