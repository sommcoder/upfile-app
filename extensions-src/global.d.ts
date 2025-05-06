// global.d.ts
declare global {
  interface Window {
    upfile: Upfile;
  }

  // Define the MerchantSettings interface globally if it's used elsewhere
  interface MerchantSettings {
    maxFileSize: number;
    maxFileCount: number;
    maxRequestSize: number;
    validFileTypes: Record<string, string>;
    cartDrawerEnabled: boolean;
    // optional:
    injectionRootSelector?: string;
    injectionParentSelector?: string;
    injectionPosition?: string;
    customHTML?: string;
    customCSS?: string;
    customJS?: string;
  }

  type FileStatus = "success" | "failed" | "fulfilled" | null;

  interface FileState {
    id: string;
    name: string;
    size: number;
    type: string;
    status: FileStatus;
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
