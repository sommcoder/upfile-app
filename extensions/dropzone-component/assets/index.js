class FileUpload {
  constructor() {
    console.log("4");

    // Top-level elements:
    this.productForm = document.querySelector('[data-type="add-to-cart-form"]');
    this.hiddenInput = null; // will be created on file submission
    this.dropzoneForm = document.getElementById("upfile__dropzone-form");
    this.fileViewerWrapper = document.getElementById(
      "upfile__fileviewer--wrapper",
    );

    if (this.dropzoneForm && this.fileViewerWrapper && this.productForm) {
      // Dropzone elements:
      this.dropzoneFileInput = this.dropzoneForm.querySelector(
        "#upfile__manual-file-input",
      );
      this.dropzoneSelectBtn = this.dropzoneForm.querySelector(
        "#upfile__select-file-btn",
      );
      this.dropzoneText = this.dropzoneForm.querySelector(
        "#upfile__dropzone-text",
      );
      // Fileviewer elements:
      this.fileViewerList = this.fileViewerWrapper.querySelector(
        "#upfile__fileviewer--item-list",
      );
      this.fileViewerOriginalRow = this.fileViewerList.querySelector(
        ".upfile__fileviewer--item-row",
      );
      this.fileViewerTrashIcon = this.fileViewerList.querySelector(
        ".upfile__fileviewer--trash-icon",
      );
      this.fileViewerStatus = this.fileViewerList.querySelector(
        ".upfile__fileviewer--item-status",
      );
      this.fileViewerPlaceholder = this.fileViewerList.querySelector(
        "#upfile__fileviewer--placeholder",
      );
      this.fileViewerErrorList = this.fileViewerWrapper.querySelector(
        "#upfile__fileviewer--error-list",
      );
      this.fileViewerErrorItem = this.fileViewerWrapper.querySelector(
        ".upfile__fileviewer--error-item",
      );

      // *State (dynamic):
      this.fileNameSet = new Set(); // tracks unique names
      this.fileViewerUIMap = new Map(); // [key: uuid]: NodeElement; for easy deletion
      this.fileStateObj = {};
      /*
      name: file.name,
      size: file.size,
      type: file.type,
      status: null,
      */
      this.errorMessages = []; // for validation errors
      this.totalFileSize = 0; // total that has been loaded so far.. we may need to track this for the user

      // *Static but loaded
      this.VALID_FILE_TYPES = {};
      this.MAX_FILE_SIZE = 20_971_520; // 20MB
      this.MAX_REQUEST_SIZE = 62_914_560; // 60MB
      this.SHOPIFY_APP_PROXY_URL = this.dropzoneForm?.dataset.proxyUrl || "";

      // *Load settings and init Event Listeners:
      this.getMerchantSettings();
      this.initEventListeners();
    } else {
      const dropzoneNotice = this.dropzoneForm?.querySelector(
        "#upfile__missing-block-notice",
      );
      if (dropzoneNotice) {
        dropzoneNotice.style.display = "flex";
        console.log(
          " this.dropzoneForm.firstElementChild:",
          this.dropzoneForm.firstElementChild,
        );
        this.dropzoneForm.firstElementChild.style.display = "none"; // remove other content
      }

      const fileViewerNotice = this.fileViewerWrapper?.querySelector(
        "#upfile__missing-block-notice",
      );
      if (fileViewerNotice) {
        fileViewerNotice.style.display = "flex";
        this.fileViewerWrapper.firstElementChild.style.display = "none"; // remove other content
      }
    }
  }

  // *State
  // State is UPDATED on file submissions and deletions
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
  // only the status is updated, files can only be added or removed
  updateFileStatus(id, status) {
    if (!Object.hasOwn(this.fileStateObj, id)) {
      console.error(`File with id: ${id} does not exist in state`);
      return;
    }

    this.fileStateObj[id] = {
      ...this.fileStateObj[id],
      status: status,
    };
    console.log("this.fileStateObj[id]:", this.fileStateObj[id]);
    console.log("updateFileStatus clear");
  }

  deleteFileState(id) {
    console.log("file state check:", this.fileStateObj);
    console.log("id:", id);
    const { [id]: _, ...newFileStateObj } = this.fileStateObj;
    this.fileStateObj = newFileStateObj;
    console.log("File removed!", this.fileStateObj);
  }

  showErrorMessages() {
    this.errorMessages.forEach((message) => {
      const newErrEl = this.fileViewerErrorItem.cloneNode(true);
      newErrEl.style.display = "block"; // make visible
      newErrEl.textContent = message; // add text
      this.fileViewerErrorList.appendChild(newErrEl);
    });
  }

  // *Validation/util: validate onDrag AND manual onSubmit
  validateFile(file) {
    console.log("file:", file);
    if (!Object.hasOwn(this.VALID_FILE_TYPES, file.type)) {
      this.errorMessages.push(`${file.name}: Invalid type of: '${file.type}'`);
    }
    if (file.size > this.MAX_FILE_SIZE) {
      this.errorMessages.push(
        `File: '${file.name}' is ${file.size - this.MAX_FILE_SIZE} too large`,
      );
    }
    if (this.fileNameSet.has(file.name)) {
      this.errorMessages.push(`${file.name} is a duplicate file name`);
    }
    if (this.errorMessages.length > 0) {
      this.showErrorMessages();
      this.resetDragUIState();
      return false;
    }
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

  // *UI Updates
  togglePlaceholderUI() {
    if (this.fileViewerUIMap.size === 0) {
      this.fileViewerPlaceholder.style.display = "none";
    }
    if (this.fileViewerUIMap.size === 1) {
      this.fileViewerPlaceholder.style.display = "flex";
    }
  }

  renderFileViewerItem(fileObj) {
    // The original row has display: none;
    const newRowEl = this.fileViewerOriginalRow.cloneNode(true);

    console.log("fileObj:", fileObj);
    newRowEl.dataset.id = fileObj.id;
    newRowEl.style.display = "grid";
    newRowEl.querySelector("[data-type]").dataset.id = fileObj.type;
    newRowEl.querySelector("[data-name]").textContent = fileObj.name;
    newRowEl.querySelector("[data-size]").textContent =
      this.getFileFormatString(fileObj.size);

    // ! status is 'SERVER status' the Client won't accept invalid files
    const statusSubEl = newRowEl.querySelector("[data-status]");
    // statusSubEl.dataset.status = "loading";
    // statusSubEl.textContent = "loading";

    console.log("newRowEl:", newRowEl);
    this.fileViewerList.insertAdjacentElement("beforeend", newRowEl);

    this.fileViewerUIMap.set(fileObj.id, newRowEl);
    this.togglePlaceholderUI();

    // Handle Trash/Delete:
    const trashEl = newRowEl.querySelector("[data-trash]");
    trashEl.dataset.id = fileObj.id;
    trashEl.addEventListener("click", (ev) => {
      this.deleteFileViewerItem(ev.target.dataset.id);
    });
    console.log("newRowEl:", newRowEl);
  }

  deleteFileViewerItem(elementId) {
    // TODO: we are failing here:  "Node.removeChild: Argument 1 is not an object"
    console.log("elementId:", elementId);
    console.log("this.fileViewerUIMap:", this.fileViewerUIMap);
    const removableEl = this.fileViewerUIMap.get(elementId); // ! get the element FIRST
    console.log("removableEl:", removableEl);
    // state:
    this.deleteFileState(elementId);
    // ui:
    this.fileViewerList.removeChild(removableEl);
    this.togglePlaceholderUI();
  }

  addVariantProps(id) {
    console.log("id:", id);
    this.hiddenInput = this.productForm?.querySelector(
      "input[name='properties[__file_id]']",
    );
    // assign the hidden input if it doesn't exist
    if (!this.hiddenInput) {
      this.hiddenInput = document.createElement("input");
      this.hiddenInput.type = "hidden";
      this.hiddenInput.name = "properties[__file_id]";
      this.hiddenInput.value = id;
      this.productForm.appendChild(this.hiddenInput); // inject into product form
    } else {
      this.hiddenInput.value += `,${id}`;
    }
    console.log("addVariantProps clear");
  }

  deleteVariantProps(fileId) {
    if (this.hiddenInput) {
      const updatedValue = this.hiddenInput.value
        .split(",")
        .filter((id) => id !== fileId)
        .join(",");
      this.hiddenInput.value = updatedValue;
      if (!updatedValue) {
        this.hiddenInput.remove(); // don't want this showing up in the Order if NOT needed
      }
    }
  }

  resetDragUIState() {
    this.dropzoneForm.removeAttribute("data-status");
    this.dropzoneForm.removeAttribute("data-drag");
    this.dropzoneText.removeAttribute("data-status");
  }

  // *Fetch
  async getMerchantSettings() {
    try {
      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/merchant`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }
      const data = await response.json();
      this.VALID_FILE_TYPES = data.fileTypeMap || [];
      this.MAX_FILE_SIZE = data.maxFileSize || 20_971_520;
      this.MAX_REQUEST_SIZE = data.maxRequestSize || 20_971_520;
    } catch (error) {
      console.error("getMerchantSettings()", error);
      return null;
    }
  }

  async postFiles(files) {
    this.errorMessages = []; // clear previous errors
    const validFilesArr = files.filter((file) => this.validateFile(file));

    const validatedFormData = new FormData();

    // build the form data and state object
    validFilesArr.forEach((file) => {
      const fileId = crypto.randomUUID();
      // state:
      this.addFileState(fileId, file);
      console.log("this.fileStateObj:", this.fileStateObj);
      this.fileNameSet.add(file.name); // track the name for uniqueness
      // form:
      validatedFormData.append("file_uuid", fileId);
      validatedFormData.append("files", file);
    });

    try {
      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/file`, {
        method: "POST",
        redirect: "manual",
        body: validatedFormData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("data.files:", data.files);
        data.files.forEach(({ id, status }) => {
          // TODO: its cause the server has a different id than the client
          this.updateFileStatus(id, status);
          this.addVariantProps(id);
          this.renderFileViewerItem(this.fileStateObj[id]);
        });
        // TODO: we probably need to implement proper server side validation
      } else {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("postFiles():", error);
    }
  }

  // ! makes a DELETE request to the server to remove the file from the db
  async deleteFiles(files) {
    // handle an individual file deletion
    // remove from private properties,
    // remove from local state
    // DELETE request to server to remove from db
    // this.deleteFileViewerItem(id);
  }

  // *Events:
  initEventListeners() {
    this.dropzoneForm.addEventListener(
      "dragenter",
      this.handleDragEnter.bind(this),
    );
    this.dropzoneForm.addEventListener("dragover", (ev) => ev.preventDefault());
    this.dropzoneForm.addEventListener(
      "dragleave",
      this.handleDragLeave.bind(this),
    );
    this.dropzoneForm.addEventListener("drop", this.handleDrop.bind(this));
    this.dropzoneSelectBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      this.dropzoneFileInput.click();
    });
    this.dropzoneFileInput.addEventListener("change", (ev) => {
      const fileArr = Array.from(ev.target.files);
      this.postFiles(fileArr);
    });
  }

  handleDragEnter(ev) {
    ev.preventDefault();
    for (const item of ev.dataTransfer.items) {
      if (this.validateFile(item)) {
        console.log("item:", item);
        this.dropzoneForm.setAttribute("data-status", "valid");
        this.dropzoneText.setAttribute("data-status", "valid");
      } else {
        this.dropzoneForm.setAttribute("data-status", "invalid");
        this.dropzoneText.setAttribute("data-status", "invalid");
      }
      this.dropzoneForm.setAttribute("data-drag", "dragging");
    }
    console.log("this.dropzoneForm:", this.dropzoneForm);
  }

  handleDragLeave(ev) {
    ev.preventDefault();
    this.resetDragUIState();
    console.log("this.dropzoneForm:", this.dropzoneForm);
  }

  handleDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.resetDragUIState();
    this.postFiles(Array.from(ev.dataTransfer.files));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FileUpload();
});
