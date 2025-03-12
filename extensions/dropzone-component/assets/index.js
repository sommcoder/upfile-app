class FileUpload {
  constructor() {
    console.log("15");

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
      this.fileViewerLoadingSpinner =
        this.fileViewerList.querySelector(".upfile__spinner");

      console.log(
        "this.fileViewerLoadingSpinner:",
        this.fileViewerLoadingSpinner,
      );

      this.fileViewerPlaceholder = this.fileViewerList.querySelector(
        "#upfile__fileviewer--placeholder",
      );

      // TODO: still need to get the error list rendering for the user
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
      this.errorMessages = []; // for validation errors
      this.totalStateFileSize = 0; // total that has been loaded so far.. we may need to track this for the user

      // *Static but loaded
      this.VALID_FILE_TYPES = {};
      this.MAX_FILE_SIZE = null;
      this.MAX_REQUEST_SIZE = null;
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
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: null,
    };
    this.fileNameSet.add(file.name);
    this.totalStateFileSize += file.size;
  }
  // only the status is updated, files can only be added or removed
  updateFileStatus(id, status) {
    if (!Object.hasOwn(this.fileStateObj, id)) {
      console.error(`File with id: ${id} does not exist in state`);
      return false;
    } else {
      this.hideLoadingSpinner(id);
      this.fileStateObj[id] = {
        ...this.fileStateObj[id],
        status: status,
      };
      console.log("this.fileStateObj[id]:", this.fileStateObj[id]);
      console.log("updateFileStatus clear");
      return true;
    }
  }

  deleteFileState(id) {
    console.log("this.totalStateFileSize:", this.totalStateFileSize);
    console.log("file state check:", this.fileStateObj);
    console.log("id:", id);
    this.totalStateFileSize -= this.fileStateObj[id].size; // ! adjust size FIRST
    console.log("this.totalStateFileSize:", this.totalStateFileSize);
    const { [id]: _, ...newFileStateObj } = this.fileStateObj;
    this.fileStateObj = newFileStateObj;
    console.log("File removed!", this.fileStateObj);
  }

  // we NEED error messages because we need feedback for manual file uploads!
  showErrorMessages() {
    this.errorMessages.forEach((message) => {
      const newErrEl = this.fileViewerErrorItem.cloneNode(true);
      newErrEl.style.display = "block"; // make visible
      newErrEl.textContent = message; // add text
      this.fileViewerErrorList.appendChild(newErrEl);
    });
  }

  // *Utility methods
  // *Validates onDrag AND manual onSubmit
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
      console.log("this.errorMessages:", this.errorMessages);
      this.showErrorMessages();
      // this.resetDragUIState();
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
    console.log("this.fileViewerPlaceholder:", this.fileViewerPlaceholder);
    console.log("this.fileViewerUIMap:", this.fileViewerUIMap);
    console.log("this.fileViewerUIMap.size:", this.fileViewerUIMap.size);
    if (this.fileViewerUIMap.size === 0) {
      this.fileViewerPlaceholder.style.display = "flex";
    }
    if (this.fileViewerUIMap.size === 1) {
      this.fileViewerPlaceholder.style.display = "none";
    }
    // otherwise, do nothing
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

    const statusSubEl = newRowEl.querySelector("[data-status]");

    console.log("newRowEl:", newRowEl);
    this.fileViewerList.insertAdjacentElement("beforeend", newRowEl);

    this.fileViewerUIMap.set(fileObj.id, newRowEl);
    this.togglePlaceholderUI();
    this.hideLoadingSpinner(fileObj.id);

    // Handle Trash/Delete:
    const trashEl = newRowEl.querySelector("[data-trash]");
    trashEl.dataset.id = fileObj.id;
    trashEl.addEventListener("click", (ev) => {
      // Optimistic update:
      const id = ev.target.dataset.id;
      this.deleteFileState(id); // state
      this.deleteFileViewerItem(id); // ui
      this.deleteFiles([id]); // fetch
    });
    console.log("newRowEl:", newRowEl);
  }

  deleteFileViewerItem(elementId) {
    // TODO: we are failing here:  "Node.removeChild: Argument 1 is not an object"
    console.log("elementId:", elementId);
    console.log("this.fileViewerUIMap:", this.fileViewerUIMap);
    const removableEl = this.fileViewerUIMap.get(elementId); // ! get the element FIRST
    console.log("removableEl:", removableEl);
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

  // TODO: sometimes the invalid status remains even when a valid file is dragged over
  resetDragUIState() {
    this.dropzoneForm.removeAttribute("data-status");
    this.dropzoneForm.removeAttribute("data-drag");
    this.dropzoneText.removeAttribute("data-status");
    console.log("resetDragUIState():", this.dropzoneForm);
  }

  hideLoadingSpinner(fileId) {
    const spinner = this.fileViewerList.querySelector(`[data-id="${fileId}"]`);
    spinner.style.display = "none";
  }

  renderLoadingSpinners(fileId, i) {
    let newSpinner;
    if (i === 0) {
      newSpinner = this.fileViewerLoadingSpinner;
    } else {
      newSpinner = this.fileViewerLoadingSpinner.cloneNode(true);
    }
    newSpinner.dataset.id = fileId;
    newSpinner.style.display = "block";
    this.fileViewerList.appendChild(newSpinner);
  }

  // TODO: should be a method to "lock" the functionality and request a page refresh in case information wasn't retrieved from the server.

  // *Fetch
  async getMerchantSettings() {
    try {
      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/merchant`, {
        method: "GET",
      });
      if (!response.ok) {
        this.dropzoneForm.textContent =
          "Server Connection Issue:\n Please reload page";
        this.fileViewerWrapper.textContent =
          "Server Connection Issue:\n Please reload page";
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }
      const data = await response.json();
      this.VALID_FILE_TYPES = data.fileTypeMap || [];
      this.MAX_FILE_SIZE = Number(data.maxFileSize);
      this.MAX_REQUEST_SIZE = Number(data.maxRequestSize);
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
    validFilesArr.forEach((file, i) => {
      const fileId = crypto.randomUUID();
      // state:
      this.addFileState(fileId, file);
      console.log("this.fileStateObj:", this.fileStateObj);
      // form:
      validatedFormData.append("file_uuid", fileId);
      validatedFormData.append("files", file);
      // ui:
      this.renderLoadingSpinners(fileId, i);
    });

    try {
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

      if (response.ok) {
        const data = await response.json();
        console.log("data.files:", data.files);

        data.files.forEach(({ id, status }) => {
          const valid = this.updateFileStatus(id, status);
          if (valid) this.addVariantProps(id); // only update if valid
          this.renderFileViewerItem(this.fileStateObj[id]);
        });
      }
    } catch (error) {
      console.error("postFiles():", error);
    }
  }

  async deleteFiles(files) {
    console.log("DELETE req, files:", files);
    // ! Optimistic UI updates: we remove the file from the UI before the server responds.
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

      if (response.ok) {
        const data = await response.json();
        console.log("data.files:", data.files);
        console.log("Deleted files:", data.deleted); // would passing a boolean back be beneficial?
        // data.files.forEach(({ id, status }) => {
        //   this.updateFileStatus(id, status);
        //   this.addVariantProps(id);
        //   this.renderFileViewerItem(this.fileStateObj[id]);
        // });
      }
    } catch (error) {
      console.error("postFiles():", error);
    }
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
        this.dropzoneForm.setAttribute("data-status", "valid");
        this.dropzoneText.setAttribute("data-status", "valid");
      } else {
        this.dropzoneForm.setAttribute("data-status", "invalid");
        this.dropzoneText.setAttribute("data-status", "invalid");
      }
      this.dropzoneForm.setAttribute("data-drag", "dragging");
    }
    console.log("handleDragEnter():", this.dropzoneForm);
  }

  handleDragLeave(ev) {
    ev.preventDefault();
    this.resetDragUIState();
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
