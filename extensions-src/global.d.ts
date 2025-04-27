// global.d.ts
declare global {
  interface UpfileSettings extends Window {}
  // Define the MerchantSettings interface globally if it's used elsewhere
  interface MerchantSettings {
    fileTypeMap: Record<string, string>;
    maxFileSize: number;
    maxFileCount: number;
    maxRequestSize: number;
  }

  type FileStatus = "success" | "failed" | "fulfilled" | null;

  interface FileState {
    id: string;
    name: string;
    size: number;
    type: string;
    status: FileStatus;
  }

  interface UploadedFileResponse {
    value: { id: string };
    status: FileStatus;
  }

  interface FileViewerRowElement extends HTMLElement {
    dataset: DOMStringMap;
  }

  interface BlockDataElement extends HTMLElement {
    dataset: {
      proxyUrl: string;
    };
  }
}

export {}; // Ensures this file is treated as a module to apply the global declaration
