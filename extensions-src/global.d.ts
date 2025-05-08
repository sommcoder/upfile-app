// global.d.ts
declare global {
  interface Window {
    upfile: UpfileAppBridge;
  }

  // Define the MerchantSettings interface globally if it's used elsewhere
  interface MerchantSettings {
    maxFileSize: number | null;
    maxFileCount: number | null;
    maxRequestSize: number | null;
    validFileTypes: Record<string, string> | null;
    cartDrawerEnabled: boolean;
    injectionRootSelector: string;
    injectionParentSelector: string;
    injectionPosition: InsertPosition | null;
    customHTML: string;
    customCSS: string;
    customJS: string;
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
