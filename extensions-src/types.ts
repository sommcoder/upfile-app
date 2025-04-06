export type FileStatus = "success" | "failed" | "fulfilled" | null;

export interface FileState {
  id: string;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
}

export interface UploadedFileResponse {
  value: { id: string };
  status: FileStatus;
}

export interface MerchantSettings {
  fileTypeMap: Record<string, string>;
  maxFileSize: number;
  maxFileCount: number;
  maxRequestSize: number;
}

export interface FileViewerRowElement extends HTMLElement {
  dataset: DOMStringMap;
}
