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

interface MerchantSettings {
  fileTypeMap: Record<string, string>;
  maxFileSize: number;
  maxFileCount: number;
  maxRequestSize: number;
}

interface FileViewerRowElement extends HTMLElement {
  dataset: DOMStringMap;
}
