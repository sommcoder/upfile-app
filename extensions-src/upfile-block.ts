import type {
  FileState,
  FileStatus,
  UploadedFileResponse,
  MerchantSettings,
  FileViewerRowElement,
} from "./types";

class FileUpload {
  productForm: HTMLFormElement | null;
  hiddenInput: HTMLInputElement | null;
  dropzoneBlock: HTMLElement | null;
  fileViewerBlock: HTMLElement | null;

  dropzoneFileInput: HTMLInputElement | null = null;
  dropzoneHelpText: HTMLElement | null = null;
  dropzoneText: HTMLElement | null = null;
  dropzoneSelectBtn: HTMLElement | null = null;
  dropzoneFileSizeTally: HTMLElement | null = null;
  dropzoneFileSizeMax: HTMLElement | null = null;

  fileViewerList: HTMLElement | null = null;
  fileViewerOriginalRow: HTMLElement | null = null;
  fileViewerTrashIcon: HTMLElement | null = null;
  fileViewerStatus: HTMLElement | null = null;
  loadingSpinner: HTMLElement | null = null;
  fileViewerPlaceholder: HTMLElement | null = null;
  fileViewerErrorList: HTMLElement | null = null;
  fileViewerErrorItem: HTMLElement | null = null;

  fileNameSet: Set<string> = new Set();
  fileViewerUIMap: Map<string, HTMLElement> = new Map();
  fileStateObj: Record<string, FileState> = {};
  errorMessages: string[] = [];
  totalStateFileSize: number = 0;

  VALID_FILE_TYPES_OBJ: Record<string, string> = {};
  MAX_FILE_SIZE: number | null = 0;
  MAX_FILE_COUNT: number | null = 0;
  MAX_REQUEST_SIZE: number | null = 0;
  SHOPIFY_APP_PROXY_URL: string = "";

  constructor() {
    console.log("7");

    this.productForm = document.querySelector('[data-type="add-to-cart-form"]');
    this.hiddenInput = null;
    this.dropzoneBlock = document.getElementById("upfile__dropzone");
    this.fileViewerBlock = document.getElementById("upfile__fileviewer");

    if (this.dropzoneBlock && this.fileViewerBlock && this.productForm) {
      // dropzone:
      this.dropzoneFileInput = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_manual_file_input",
      );
      this.dropzoneHelpText = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_help_text",
      );
      this.dropzoneText = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_text",
      );
      console.log("this.dropzoneText:", this.dropzoneText);

      this.dropzoneSelectBtn = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_select_file_btn",
      );

      this.dropzoneFileSizeTally = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_file_size_tally",
      );
      this.dropzoneFileSizeMax = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_file_size_max",
      );

      // fileviewer:
      this.fileViewerList = this.fileViewerBlock.querySelector(
        "#upfile__fileviewer_item_list",
      );

      if (!this.fileViewerList) return;

      this.fileViewerOriginalRow = this.fileViewerList.querySelector(
        ".upfile__fileviewer_item_row",
      );
      this.fileViewerTrashIcon = this.fileViewerList?.querySelector(
        ".upfile__fileviewer_trash_icon",
      );
      this.fileViewerStatus = this.fileViewerList.querySelector(
        ".upfile__fileviewer_item_status",
      );

      /* we can clone the spinner to use in dropzone */
      this.loadingSpinner =
        this.fileViewerList.querySelector(".upfile__spinner");

      this.fileViewerPlaceholder = this.fileViewerList.querySelector(
        "#upfile__fileviewer_placeholder",
      );
      this.fileViewerErrorList = this.fileViewerBlock.querySelector(
        "#upfile__fileviewer_error_list",
      );
      this.fileViewerErrorItem = this.fileViewerBlock.querySelector(
        ".upfile__fileviewer_error_item",
      );

      // *State (dynamic):
      this.fileNameSet = new Set(); // tracks unique names
      this.fileViewerUIMap = new Map(); // tracks nodes
      this.fileStateObj = {}; // tracks file props
      this.errorMessages = [];
      this.totalStateFileSize = 0; // running total

      // *Static (loaded)
      this.VALID_FILE_TYPES_OBJ = {};
      this.MAX_FILE_SIZE = null;
      this.MAX_FILE_COUNT = null;
      this.MAX_REQUEST_SIZE = null;
      this.SHOPIFY_APP_PROXY_URL = this.dropzoneBlock?.dataset.proxyUrl || "";

      // *Load settings and init Event Listeners:
      this.getMerchantSettings();
      this.initEventListeners();
    } else {
      const dropzoneNotice = this.dropzoneBlock?.querySelector(
        "#upfile__dropzone_missing_block_notice",
      );
      if (dropzoneNotice instanceof HTMLElement) {
        dropzoneNotice.style.display = "flex";
        if (!this.dropzoneBlock) return;

        const firstChild = this.dropzoneBlock.firstElementChild;
        // Ensure that firstChild is not null and is an HTMLElement
        if (firstChild instanceof HTMLElement) {
          firstChild.style.display = "none"; // Hide the first child element
        }
      }
      const fileViewerNotice = this.fileViewerBlock?.querySelector(
        "#upfile__dropzone_missing_block_notice",
      );
      if (fileViewerNotice instanceof HTMLElement) {
        fileViewerNotice.style.display = "flex";

        // Ensure that firstElementChild is not null and is an HTMLElement
        const firstChild = this.fileViewerBlock?.firstElementChild;
        if (firstChild instanceof HTMLElement) {
          firstChild.style.display = "none"; // Remove other content
        }
      }
    }
  }

  // *state
  addFileState(fileId: string, file: File) {
    this.fileStateObj[fileId] = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: null,
    };
    this.fileNameSet.add(file.name);
    this.totalStateFileSize += file.size;
  }

  updateFileStatus(id: string, status: FileStatus): boolean {
    if (!Object.hasOwn(this.fileStateObj, id)) {
      console.error(`File with id: ${id} does not exist in state`);
      return false;
    }
    const itemStatus =
      status === "fulfilled" || status === "success" ? "success" : "failed";
    this.fileStateObj[id].status = itemStatus;

    const statusEl = this.fileViewerUIMap
      .get(id)
      ?.querySelector<HTMLElement>("[data-status]");
    if (statusEl) {
      statusEl.textContent = itemStatus;
      statusEl.dataset.status = itemStatus;
    }

    return true;
  }

  deleteFileState(id: string) {
    const file = this.fileStateObj[id];
    this.totalStateFileSize -= file.size;
    this.fileNameSet.delete(file.name);
    delete this.fileStateObj[id];
    this.fileViewerUIMap.delete(id);
  }

  addVariantProps(id: string) {
    if (this.productForm) {
      this.hiddenInput = this.productForm.querySelector<HTMLInputElement>(
        "input[name='properties[__upfile_id]']",
      );
    }

    if (!this.hiddenInput) {
      this.hiddenInput = document.createElement("input");
      this.hiddenInput.type = "hidden";
      this.hiddenInput.name = "properties[__upfile_id]";
      this.hiddenInput.value = id;
      this.productForm?.appendChild(this.hiddenInput);
    } else {
      this.hiddenInput.value += `,${id}`;
    }
  }

  deleteVariantProps(fileId: string) {
    if (this.hiddenInput) {
      const updatedValue = this.hiddenInput.value
        .split(",")
        .filter((id) => id !== fileId)
        .join(",");
      this.hiddenInput.value = updatedValue;
    }
  }

  validateSubmittedFile(file: File): boolean {
    this.errorMessages = [];

    if (!Object.hasOwn(this.VALID_FILE_TYPES_OBJ, file.type)) {
      this.errorMessages.push(
        `'${file.name}' is an invalid file type: (${file.type})`,
      );
    }

    if (this.MAX_FILE_SIZE !== null && this.MAX_REQUEST_SIZE) {
      if (file.size > this.MAX_FILE_SIZE) {
        this.errorMessages.push(
          `'${file.name}' exceeds the max size by: ${this.formatToByteStr(file.size - this.MAX_FILE_SIZE)}`,
        );
      }
      if (this.fileNameSet.has(file.name)) {
        this.errorMessages.push(`'${file.name}' is a DUPLICATE file name`);
      }
      if (this.totalStateFileSize + file.size > this.MAX_REQUEST_SIZE) {
        this.errorMessages.push(
          `'${file.name}' exceeds combined permitted size`,
        );
      }
    }

    return this.errorMessages.length === 0;
  }

  validateDraggedFile(file: File): boolean {
    return Object.hasOwn(this.VALID_FILE_TYPES_OBJ, file.type);
  }

  formatToByteStr(byteSize: number): string {
    let size = byteSize;
    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  prepareForFileUpload(file: File, i: number, form: FormData) {
    const fileId = crypto.randomUUID();
    this.addFileState(fileId, file);
    form.append("file_uuid", fileId);
    form.append("files", file);
    this.renderFileViewerSpinners(fileId, i);
  }

  togglePlaceholderUI() {
    if (!this.fileViewerPlaceholder) return;
    if (this.fileViewerUIMap.size === 0) {
      this.fileViewerPlaceholder.style.display = "flex";
    } else if (this.fileViewerUIMap.size === 1) {
      this.fileViewerPlaceholder.style.display = "none";
    }
  }

  renderFileViewerItem(fileObj: FileState) {
    let newRowEl = this.fileViewerOriginalRow?.cloneNode(
      true,
    ) as FileViewerRowElement | null;

    if (!newRowEl || newRowEl === null) return;

    // update data:
    newRowEl.dataset.id = fileObj.id;

    // Safely set dataset and textContent
    const nameEl = newRowEl.querySelector<HTMLElement>("[data-name]");
    if (nameEl) {
      nameEl.textContent = fileObj.name;
    }

    const sizeEl = newRowEl.querySelector<HTMLElement>("[data-size]");
    if (sizeEl) {
      sizeEl.textContent = this.formatToByteStr(fileObj.size);
    }

    const trashEl = newRowEl.querySelector<HTMLElement>("[data-trash]");
    if (trashEl) {
      trashEl.dataset.id = fileObj.id;

      // Handle Delete:
      trashEl.addEventListener("click", (ev) => {
        const target = ev.target as HTMLElement;
        const fileId = target.dataset.id;
        if (fileId) {
          this.handleFileDelete(fileId);
        }
      });
    }

    // add to DOM:?
    this.fileViewerList?.appendChild(newRowEl);

    // make visible:
    newRowEl.style.display = "grid";
    newRowEl.style.opacity = "1";

    // add to Map once rendered
    this.fileViewerUIMap.set(fileObj.id, newRowEl);

    // ui:
    this.togglePlaceholderUI();
    this.hideLoadingSpinner(fileObj.id);
  }

  deleteFileViewerItem(elementId) {
    const removableEl = this.fileViewerUIMap.get(elementId);
    this.fileViewerUIMap.delete(elementId);
    this.fileViewerList.removeChild(removableEl);
  }

  updateTallyElementText() {
    this.dropzoneFileSizeTally.textContent = this.formatToByteStr(
      this.totalStateFileSize,
    );
  }

  resetDragUI() {
    this.dropzoneSelectBtn.style.display = "flex";
    this.dropzoneBlock.removeAttribute("data-status");
    this.dropzoneBlock.removeAttribute("data-drag");
    this.dropzoneText.style.display = "none";
    this.dropzoneText.removeAttribute("data-status");
  }

  hideLoadingSpinner(fileId) {
    this.fileViewerList.querySelector(`[data-id="${fileId}"]`).style.display =
      "none";
  }

  renderLoadingSpinner(el) {
    // el is the element that we will swap for our loading spinner
    const spinner = this.loadingSpinner.cloneNode(true);

    // Store the original element's parent and next sibling
    const parent = el.parentNode;
    const nextSibling = el.nextSibling;

    // Temporarily remove the original element
    el.remove();

    // Insert the spinner in its place
    parent.insertBefore(spinner, nextSibling);

    return function disableSpinner() {
      spinner.remove();
      parent.insertBefore(el, nextSibling);
    };
  }

  // tracking index and using fileId
  renderFileViewerSpinners(id: string, index: number) {
    if (!this.fileViewerOriginalRow || !this.fileViewerList) return;

    const newRow = this.fileViewerOriginalRow.cloneNode(true) as HTMLElement;
    newRow.id = id;
    newRow.classList.remove("hidden");
    const filenameEl = newRow.querySelector(".upfile__fileviewer_item_name");
    const statusEl = newRow.querySelector(".upfile__fileviewer_item_status");

    if (filenameEl) filenameEl.textContent = this.fileStateObj[id].name;
    if (statusEl) {
      statusEl.textContent = "uploading...";
      statusEl.setAttribute("data-status", "uploading");
    }

    const trashIcon = newRow.querySelector(".upfile__fileviewer_trash_icon");
    if (trashIcon) {
      trashIcon.addEventListener("click", () => {
        this.fileViewerList?.removeChild(newRow);
        this.deleteFileState(id);
        this.deleteVariantProps(id);
        this.togglePlaceholderUI();
        this.updateSizeTallyUI();
      });
    }

    this.fileViewerList.insertBefore(newRow, this.fileViewerPlaceholder!);
    this.fileViewerUIMap.set(id, newRow);
  }

  renderErrorMessages(errors: string[]) {
    if (!this.fileViewerErrorList || !this.fileViewerErrorItem) return;

    this.fileViewerErrorList.innerHTML = ""; // Clear existing errors

    errors.forEach((msg) => {
      const li = this.fileViewerErrorItem.cloneNode(true) as HTMLElement;
      li.classList.remove("hidden");
      li.textContent = msg;
      this.fileViewerErrorList?.appendChild(li);
    });

    this.fileViewerErrorList.style.display = "block";
  }

  updateSizeTallyUI() {
    if (this.dropzoneFileSizeTally) {
      this.dropzoneFileSizeTally.textContent = this.formatToByteStr(
        this.totalStateFileSize,
      );
    }
  }

  async uploadSelectedFiles(fileList: FileList) {
    const form = new FormData();

    Array.from(fileList).forEach((file, index) => {
      if (!this.validateSubmittedFile(file)) {
        this.renderErrorMessages(this.errorMessages);
        return;
      }

      this.prepareForFileUpload(file, index, form);
    });

    if (form.has("files")) {
      try {
        const uploadedFiles = await this.postFiles(form);
        uploadedFiles.forEach(({ value, status }) => {
          this.addVariantProps(value.id);
          this.updateFileStatus(value.id, status);
        });
        this.updateSizeTallyUI();
        this.togglePlaceholderUI();
      } catch (err) {
        console.error(err);
        this.renderErrorMessages([
          "There was an error uploading your files. Please try again.",
        ]);
      }
    }
  }

  async getMerchantSettings() {
    try {
      const res = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/settings`);
      if (!res.ok) {
        throw new Error("Failed to fetch merchant settings");
      }

      const settings: MerchantSettings = await res.json();
      this.VALID_FILE_TYPES_OBJ = settings.fileTypeMap;
      this.MAX_FILE_SIZE = settings.maxFileSize;
      this.MAX_FILE_COUNT = settings.maxFileCount;
      this.MAX_REQUEST_SIZE = settings.maxRequestSize;

      if (this.dropzoneFileSizeMax) {
        this.dropzoneFileSizeMax.textContent = this.formatToByteStr(
          this.MAX_REQUEST_SIZE,
        );
      }
    } catch (err) {
      console.error("Could not get merchant settings:", err);
    }
  }

  async postFiles(files: File[]): Promise<void> {
    try {
      this.resetErrorMessageList();

      const validFilesArr = files.filter((file) =>
        this.validateSubmittedFile(file),
      );

      if (this.errorMessages.length > 0 || validFilesArr.length === 0) {
        this.renderErrorMessages();
        return;
      }

      const validatedFormData = new FormData();
      validFilesArr.forEach((file, i) =>
        this.prepareForFileUpload(file, i, validatedFormData),
      );

      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/file`, {
        method: "POST",
        redirect: "manual",
        body: validatedFormData,
        headers: {
          "Content-Length": this.totalStateFileSize.toString(),
        },
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const data: UploadedFile[] = await response.json();
      console.log("data:", data);

      data.forEach(({ value, status }) => {
        this.handleFileAdd(value, status);
      });
    } catch (error) {
      console.error("postFiles():", error);
    }
  }

  async deleteFiles(files: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/file`, {
        method: "DELETE",
        redirect: "manual",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(files),
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      const data: DeleteFileResponse[] = await response.json();
      data.forEach((file) => {
        if (file.status !== "fulfilled") {
          console.error(`There was a server error in deleting file: ${file}`);
        }
      });
    } catch (error) {
      console.error("deleteFiles():", error);
    }
  }

  initEventListeners(): void {
    this.dropzoneBlock?.addEventListener(
      "dragenter",
      this.handleDragEnter.bind(this),
    );

    this.dropzoneBlock?.addEventListener("dragover", (ev: DragEvent) => {
      ev.preventDefault();
    });

    this.dropzoneBlock?.addEventListener(
      "dragleave",
      this.handleDragLeave.bind(this),
    );

    this.dropzoneBlock?.addEventListener("drop", this.handleDrop.bind(this));

    this.dropzoneSelectBtn?.addEventListener("click", (ev: MouseEvent) => {
      ev.preventDefault();
      this.dropzoneFileInput?.click();
    });

    this.dropzoneFileInput?.addEventListener("change", (ev: Event) => {
      const input = ev.target as HTMLInputElement;
      const fileArr = Array.from(input.files || []);
      this.postFiles(fileArr);
    });
  }

  handleFileAdd(value: { id: string }, status: FileStatus): void {
    this.renderFileViewerItem(this.fileStateObj[value.id]);
    if (this.updateFileStatus(value.id, status)) {
      this.addVariantProps(value.id);
      this.updateTallyElementText();
    }
  }

  handleFileDelete(id: string): void {
    this.deleteVariantProps(id);
    this.deleteFileViewerItem(id);
    this.deleteFileState(id);
    this.updateTallyElementText();
    this.errorMessages = [];
    this.togglePlaceholderUI();
    this.deleteFiles([id]);
  }

  handleDragEnter(ev: DragEvent): void {
    ev.preventDefault();
    this.dropzoneBlock?.setAttribute("data-drag", "dragging");
    if (!this.dropzoneSelectBtn) return;

    this.dropzoneSelectBtn.style.display = "none";

    const items = ev.dataTransfer?.items;
    if (!items) return;

    const fileCount = items.length;
    let txt = "";

    for (const item of items) {
      const isValid = this.validateDraggedFile(item);
      this.dropzoneBlock?.setAttribute(
        "data-status",
        isValid ? "valid" : "invalid",
      );
      this.dropzoneText?.setAttribute(
        "data-status",
        isValid ? "valid" : "invalid",
      );

      txt =
        fileCount > 1
          ? this.dropzoneText.dataset[
              isValid ? "validTextPlural" : "invalidTextPlural"
            ]!
          : this.dropzoneText.dataset[
              isValid ? "validTextSingular" : "invalidTextSingular"
            ]!;
      this.dropzoneText.textContent = txt;
      this.dropzoneText.style.display = "flex";

      console.log(
        "this.dropzoneText.textContent:",
        this.dropzoneText?.textContent,
      );
    }
  }

  handleDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.resetDragUI();
  }

  handleDrop(ev: DragEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.resetDragUI();

    const files = ev.dataTransfer?.files;
    if (!files) return;
    this.postFiles(Array.from(files));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let fileUpload;
  if (!fileUpload) {
    fileUpload = new FileUpload();
  }
});
