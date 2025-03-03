class FileUpload {
  constructor() {
    console.log("15");
    this.formEl = document.querySelector('[data-type="add-to-cart-form"]');

    // blocks:
    this.dropzoneWrapperEl = document.getElementById(
      "upfile__dropzone-wrapper",
    );
    this.fileViewerList = document.getElementById(
      "upfile__fileviewer--item-list",
    );

    // *dropzone
    if (this.dropzoneWrapperEl) {
      this.manualFileInputEl = this.dropzoneWrapperEl.querySelector(
        "#upfile__manual-file-input",
      );
      this.selectFileBtn = this.dropzoneWrapperEl.querySelector(
        "#upfile__select-file-btn",
      );
      this.dropzoneTextEl = this.dropzoneWrapperEl.querySelector(
        "#upfile__dropzone-text",
      );
      this.toastContainerEl = this.dropzoneWrapperEl.querySelector(
        "#upfile__toast-container",
      );

      if (this.toastContainerEl) {
        this.toastTextEl = this.toastContainerEl.firstElementChild;
        console.log("this.toastTextEl:", this.toastTextEl);
      }
    } else {
      this.displayMissingBlockError("dropzone", this.fileViewerList);
    }

    // *fileviewer:
    if (this.fileViewerList) {
      this.fileViewerOriginalRow = this.fileViewerList.querySelector(
        "#upfile__fileviewer--item-row",
      );
      this.fileViewerTrashIcon = this.fileViewerList.querySelector(
        "#upfile__fileviewer--trash-icon",
      );
      this.fileViewerStatus = this.fileViewerList.querySelector(
        "#upfile__fileviewer--item-status",
      );
      this.fileViewerPlaceholder = this.fileViewerList.querySelector(
        "#upfile__fileviewer--placeholder",
      );
    } else {
      this.displayMissingBlockError("fileviewer", this.dropzoneWrapperEl);
    }

    // *State (dynamic):
    this.canSubmit = true; // a switch to enable/disable submissions
    this.fileNameSet = new Set();
    this.fileViewerRowState = new Map(); // [key: uuid]: element;
    this.fileStateObj = {};
    // props (static):
    this.SHOPIFY_APP_PROXY_URL =
      "https://custom-component-portfolio.myshopify.com/apps/dropzone";
    this.MAX_FILE_SIZE = 20_971_520; // 20MB
    this.VALID_FILE_TYPES = {};

    // launch functions (after elements):
    this.getMerchantSettings();
    this.initEventListeners();
  }

  // ! this is definitely NOT needed if we need to cut JS bloat:
  displayMissingBlockError(name, parentEl) {
    const errorMessage = document.createElement("span");
    errorMessage.textContent = `Add ${name} Block to Product Form`;
    errorMessage.style.height = "100%";
    errorMessage.style.width = "100%";
    errorMessage.style.backgroundColor = "orangered";
    parentEl.insertAdjacentElement("beforeend", errorMessage);
  }

  // *State
  // there is only add, remove, no update!
  addFileState(fileId, file) {
    console.log("file:", file);
    // add valid files to stateObj:
    this.fileStateObj[fileId] = {
      name: file.name,
      size: file.size,
      type: file.type,
      status: null,
    };
  }

  // TODO: need to rework this:
  setFileValid({ type, valid }) {
    this.fileState.types = type;
    this.fileState.allValid = valid;
  }

  deleteFileState(id) {
    if (!this.fileStateObj[id]) {
      // warn/issue: 'cannot find id in state'
      // log this to the server?
      return;
    }
    console.log("file state check:", this.fileStateObj);
    console.log("id:", id);

    // delete state:
    const { [id]: _, ...newFileStateObj } = this.fileStateObj;
    this.fileStateObj = newFileStateObj;
    console.log("File removed!", this.fileStateObj);
  }

  showErrorMessages(errMsgArr) {
    console.log("errMsgArr:", errMsgArr);

    // clear previous toasts:
    this.toastContainerEl.innerHTML = "";

    // Determine how many errors to display
    const maxVisibleErrors = 4;
    const errorsToShow = errMsgArr.slice(0, maxVisibleErrors);

    // Render each error message
    errorsToShow.forEach((message) => {
      // TODO: lets move this to the server in Liquid and just cloneNode as needed

      const toast = document.createElement("div");
      toast.id = "upfile__toast-text";
      toast.textContent = message;
      this.toastContainerEl.appendChild(toast);
    });

    // Show "... and more" if there are more than 4 errors
    if (errMsgArr.length > maxVisibleErrors) {
      // TODO: lets move this to the server in Liquid and just cloneNode as needed
      const moreToast = document.createElement("div");
      // I moved the moreText element to the server
      this.toastContainerEl.appendChild(moreToast);
    }

    // Auto-remove messages after 3 seconds
    setTimeout(() => {
      this.toastContainerEl.innerHTML = "";
    }, 3000);
  }

  // *Validation/util:
  validateFile(file) {
    console.log("file:", file);

    // Array to store any error messages
    const errorMessages = [];

    // Check for valid file type
    if (!Object.hasOwn(this.VALID_FILE_TYPES, file.type)) {
      errorMessages.push(`Invalid file type: ${file.name}`);
    }

    // Check for file size limit
    if (file.size > this.MAX_FILE_SIZE) {
      errorMessages.push(`File too large: ${file.name}`);
    }

    // Check for duplicate file names
    if (this.fileNameSet.has(file.name)) {
      errorMessages.push(`Duplicate file: ${file.name}`);
    }

    // If there are any errors, show them:
    if (errorMessages.length > 0) {
      this.showErrorMessages(errorMessages);
      return false;
    }
    // TODO: this removeAttribute part seems wrong
    this.dropzoneWrapperEl.removeAttribute("data-status");
    this.dropzoneTextEl.removeAttribute("data-status");
    return true;
  }

  getFileFormatString(byteSize) {
    let size = byteSize;
    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  isFileNameUnique(name) {
    if (!this.fileNameSet.has(name)) {
      return false;
    }
    return true;
  }

  // *UI Updates
  hideFileViewerPlaceholder() {
    this.fileViewerPlaceholder.style.display = "none";
  }

  cloneFileViewerItem(fileId, file) {
    // The original row has display: none;
    const newRowEl = this.fileViewerOriginalRow.cloneNode(true);
    newRowEl.dataset.id = fileId;

    newRowEl.querySelector("[data-type]").dataset.id = fileId;
    newRowEl.querySelector("[data-name]").textContent = file.name;
    newRowEl.querySelector("[data-size]").textContent = file.size;
    newRowEl.querySelector("[data-status]").textContent = "loading";

    // TODO: should also add a loading spinner until we hear back from the server!
    this.fileViewerList.insertAdjacentElement("beforeend", newRowEl);

    if (!this.fileViewerRowState.has(fileId)) {
      this.fileViewerRowState.set(fileId, newRowEl);
    }
    console.log("this.fileViewerRowState:", this.fileViewerRowState);

    // handle Trash/Delete:
    const trashEl = newRowEl.querySelector("[data-trash]");
    trashEl.dataset.id = fileId;
    trashEl.addEventListener("click", (ev) => {
      console.log("ev:", ev);
      console.log("ev.target.dataset.id:", ev.target.dataset.id);
      this.removeFileViewerItem(ev.target.dataset.id);
    });

    console.log("newRowEl:", newRowEl);
    return newRowEl;
  }

  renderFileViewerItem(fileId, file) {
    const newItemEl = this.cloneFileViewerItem(fileId, file);
    this.hideFileViewerPlaceholder();
  }

  removeFileViewerItem(elementId) {
    const removableEl = this.fileViewerRowState.get(elementId); // ! get the element FIRST
    console.log("removableEl:", removableEl);
    // state:
    this.deleteFileState(elementId);
    // ui:
    this.fileViewerList.removeChild(removableEl);
    if (this.fileViewerRowState.size > 0) this.hideFileViewerPlaceholder();
  }

  addVariantProperties(files) {
    const uuidStr = files.map(({ id }) => id).join(",");
    console.log("uuidStr:", uuidStr);
    let hiddenInput = document.getElementById(
      "input[name='properties[__file_id]']",
    );
    if (!hiddenInput) {
      hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = "properties[__file_id]";
      hiddenInput.value = uuidStr;
      this.formEl.appendChild(hiddenInput);
    } else {
      hiddenInput.value += `,${uuidStr}`;
    }
  }
  // ! deletes one at a time. Might be more optimized to take in a CSV string or compare to a Set and delete them all in one pass of filter()
  deleteVariantProperties(fileId) {
    const hiddenInput = document.querySelector(
      "input[name='properties[__file_id]']",
    );
    if (hiddenInput) {
      let currentValue = hiddenInput.value;
      // Remove the specified fileId from the current value
      const updatedValue = currentValue
        .split(",") // Split the values into an array
        .filter((id) => id !== fileId) // Remove the id to delete
        .join(","); // Join them back into a string

      // Update the hidden input value
      hiddenInput.value = updatedValue;

      // Optionally remove the input if it's empty after deletion
      if (!updatedValue) {
        hiddenInput.remove();
      }
    }
  }

  // *Fetch
  async getMerchantSettings() {
    try {
      console.log("this.SHOPIFY_APP_PROXY_URL:", this.SHOPIFY_APP_PROXY_URL);
      // Fetch from the app proxy
      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/merchant`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("data:", data);
      this.VALID_FILE_TYPES = data.fileTypeMap || [];
      return;
    } catch (error) {
      console.error("getMerchantSettings()", error);
      return null;
    }
  }

  async postFiles(files) {
    // TODO: maybe we GET the HTML from the server and send it back to the client as to reduce this file(s) size. We can then clone and remove the elements as needed
    // We just load up SKELETON components on the client and serve it from the server
    const validFilesArr = files.filter((file) => this.validateFile(file));
    const validatedFormData = new FormData();
    validFilesArr.forEach((file) => {
      const fileId = crypto.randomUUID();
      // form:
      validatedFormData.append("file_uuid", fileId);
      validatedFormData.append("files", file);
      // state:
      this.addFileState(fileId, file);
      this.fileNameSet.add(file.name); // track the name for uniqueness
      // ui:
      this.renderFileViewerItem(fileId, file);
    });

    try {
      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/file`, {
        method: "POST",
        redirect: "manual",
        body: validatedFormData,
      });

      if (response.ok) {
        const data = await response.json();
        // TODO: should do a status check here and update the UI to make sure everything is good on the server/db backend

        this.addVariantProperties(data.files);
      }
    } catch (error) {
      console.error("postFiles() error:", error);
    }
  }

  async deleteFiles(files) {
    // handle an individual file deletion
    // remove from private properties,
    // remove from local state
    // DELETE request to server to remove from db
    // this.removeFileViewerItem(id);
  }

  // *Events:
  initEventListeners() {
    this.dropzoneWrapperEl.addEventListener(
      "dragenter",
      this.handleDragEnter.bind(this),
    );
    this.dropzoneWrapperEl.addEventListener("dragover", (ev) =>
      ev.preventDefault(),
    );
    this.dropzoneWrapperEl.addEventListener(
      "dragleave",
      this.handleDragLeave.bind(this),
    );
    this.dropzoneWrapperEl.addEventListener("drop", this.handleDrop.bind(this));
    this.selectFileBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      this.manualFileInputEl.click();
    });
    this.manualFileInputEl.addEventListener("change", (ev) => {
      const fileArr = Array.from(ev.target.files);
      this.postFiles(fileArr);
    });
  }

  handleDragEnter(ev) {
    ev.preventDefault();
    for (const item of ev.dataTransfer.items) {
      // validation:
      if (this.validateFile(item)) {
        // TODO: need to check if for filename UNIQUENESS
        console.log("item:", item);
        // TODO: i feel like setFileValid is no longer relevant
        this.setFileValid({ type: [item.type], valid: true });

        this.dropzoneWrapperEl.setAttribute("data-status", "valid");
        this.dropzoneTextEl.setAttribute("data-status", "valid");
        // TODO: add styling to the upload icon if visible
      } else {
        this.setFileValid({ type: [item.type], valid: false });
        this.dropzoneWrapperEl.setAttribute("data-status", "invalid");
        this.dropzoneTextEl.setAttribute("data-status", "invalid");
      }
      // all states share dragging attribute:
      this.dropzoneWrapperEl.setAttribute("data-drag", "dragging");
    }
    console.log("this.fileState:", this.fileState);
    console.log("this.dropzoneWrapperEl:", this.dropzoneWrapperEl);
  }

  handleDragLeave(ev) {
    ev.preventDefault();
    this.setFileValid({ type: [], valid: null });
    // TODO: need to adjust this to and data attributes:
    this.dropzoneWrapperEl.removeAttribute("data-status");
    this.dropzoneTextEl.removeAttribute("data-status");

    console.log("this.fileState:", this.fileState);
    console.log("this.dropzoneWrapperEl:", this.dropzoneWrapperEl);
  }

  handleDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.postFiles(Array.from(ev.dataTransfer.files));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FileUpload();
});
