class FileUpload {
  constructor() {
    console.log("15");

    // required top-level elements:
    this.productForm = document.querySelector('[data-type="add-to-cart-form"]');
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

      console.log("dropzoneFileInput:", this.dropzoneFileInput);
      console.log("dropzoneSelectBtn:", this.dropzoneSelectBtn);
      console.log("dropzoneText:", this.dropzoneText);
      console.log("fileViewerList:", this.fileViewerList);
      console.log("fileViewerOriginalRow:", this.fileViewerOriginalRow);
      console.log("fileViewerTrashIcon:", this.fileViewerTrashIcon);
      console.log("fileViewerStatus:", this.fileViewerStatus);
      console.log("fileViewerPlaceholder:", this.fileViewerPlaceholder);
      console.log("fileViewerErrorList:", this.fileViewerErrorList);
      console.log("fileViewerErrorItem:", this.fileViewerErrorItem);

      // *State (dynamic):
      this.canSubmit = true; // permits making a POST request
      this.fileNameSet = new Set(); // tracks unique names
      this.fileViewerRowState = new Map(); // [key: uuid]: element;
      this.fileStateObj = {}; // Loading, Success, Error
      this.errorMessages = []; // for validation errors

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

  deleteFileState(id) {
    console.log("file state check:", this.fileStateObj);
    console.log("id:", id);
    const { [id]: _, ...newFileStateObj } = this.fileStateObj;
    this.fileStateObj = newFileStateObj;
    console.log("File removed!", this.fileStateObj);
  }

  // TODO: get errors to render
  showErrorMessages() {
    // clear previous msg:
    this.errorMessages = []; // don't need org ref

    // Render each error message
    this.errorMessages.forEach((message) => {
      document.cloneNode(this.fileViewerErrorItem);
      this.fileViewerErrorList.appendChild();
    });
    // Show "... and more" if there are more than 4 errors
    if (this.errorMessages.length > maxVisibleErrors) {
      // TODO: lets move this to the server in Liquid and just cloneNode as needed
      const moreToast = document.createElement("div");
      // I moved the moreText element to the server
      this.toastContainerEl.appendChild(moreToast);
    }
  }

  // *Validation/util:
  // validate on drag OR when a user selects file(s)
  validateFile(file) {
    console.log("file:", file);
    // valid file type
    if (!Object.hasOwn(this.VALID_FILE_TYPES, file.type)) {
      this.errorMessages.push(`Invalid file type: ${file.name}`);
    }
    // size limit
    if (file.size > this.MAX_FILE_SIZE) {
      this.errorMessages.push(`File too large: ${file.name}`);
    }
    // duplicate file names
    if (this.fileNameSet.has(file.name)) {
      this.errorMessages.push(`Duplicate file: ${file.name}`);
    }
    // If there are any errors, show them:
    if (this.errorMessages.length > 0) {
      this.showErrorMessages();
      this.canSubmit = false;
      return false;
    }
    // TODO: this removeAttribute part seems wrong
    this.dropzoneForm.removeAttribute("data-status");
    this.dropzoneText.removeAttribute("data-status");
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
  hideFileViewerPlaceholder() {
    this.fileViewerPlaceholder.style.display = "none";
  }

  cloneFileViewerItem(fileId, file) {
    // The original row has display: none;
    const newRowEl = this.fileViewerOriginalRow.cloneNode(true);

    // set props/attributes:
    newRowEl.dataset.id = fileId;
    newRowEl.style.display = "grid";
    newRowEl.querySelector("[data-type]").dataset.id = fileId;
    newRowEl.querySelector("[data-name]").textContent = file.name;
    newRowEl.querySelector("[data-size]").textContent = file.size;
    newRowEl.querySelector("[data-status]").textContent = "loading";

    this.fileViewerList.insertAdjacentElement("beforeend", newRowEl);

    if (!this.fileViewerRowState.has(fileId)) {
      this.fileViewerRowState.set(fileId, newRowEl);
    }
    console.log("this.fileViewerRowState:", this.fileViewerRowState);

    // Handle Trash/Delete:
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
      this.productForm.appendChild(hiddenInput);
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
      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/merchant`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }
      const data = await response.json();
      this.VALID_FILE_TYPES = data.fileTypeMap || [];
      // Default is ONE file at a time!
      // This needs to be checked on the server
      this.MAX_FILE_SIZE = data.maxFileSize || 20_971_520;
      this.MAX_REQUEST_SIZE = data.maxRequestSize || 20_971_520;
    } catch (error) {
      console.error("getMerchantSettings()", error);
      return null;
    }
  }

  async postFiles(files) {
    this.errorMessages = []; // clear previous errors
    const validFilesArr = files.every((file) => this.validateFile(file));

    // prevent submission until ALL files submitted are valid
    if (this.canSubmit) {
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
      // validation:
      if (this.validateFile(item)) {
        // TODO: need to check if for filename UNIQUENESS
        console.log("item:", item);
        this.dropzoneForm.setAttribute("data-status", "valid");
        this.dropzoneText.setAttribute("data-status", "valid");
        // TODO: add styling to the upload icon if visible
      } else {
        this.dropzoneForm.setAttribute("data-status", "invalid");
        this.dropzoneText.setAttribute("data-status", "invalid");
      }
      // all states share dragging attribute:
      this.dropzoneForm.setAttribute("data-drag", "dragging");
    }

    console.log("this.dropzoneForm:", this.dropzoneForm);
  }

  handleDragLeave(ev) {
    ev.preventDefault();
    // TODO: need to adjust this to and data attributes:
    this.dropzoneForm.removeAttribute("data-status");
    this.dropzoneText.removeAttribute("data-status");

    console.log("this.dropzoneForm:", this.dropzoneForm);
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
