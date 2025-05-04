// global.d.ts
declare global {
  interface Window {
    upfile: Upfile;
  }

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
