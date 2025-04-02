class FileUpload {
  constructor() {
    console.log("1");

    this.productForm = document.querySelector('[data-type="add-to-cart-form"]');
    this.hiddenInput = null;
    this.dropzoneForm = document.getElementById("upfile__dropzone_form");
    this.fileViewerWrapper = document.getElementById(
      "upfile__fileviewer_wrapper",
    );

    if (this.dropzoneForm && this.fileViewerWrapper && this.productForm) {
      this.dropzoneFileInput = this.dropzoneForm.querySelector(
        "#upfile__manual_file_input",
      );
      this.dropzoneText = this.dropzoneForm.querySelector(
        "#upfile__dropzone_text",
      );
      this.dropzoneSelectBtn = this.dropzoneForm.querySelector(
        "#upfile__select_file_btn",
      );
      this.dropzoneFileSizeTally = this.dropzoneForm.querySelector(
        "#upfile__file_size_tally",
      );
      this.dropzoneFileSizeMax = this.dropzoneForm.querySelector(
        "#upfile__file_size_max",
      );

      // TODO: need to update id's to be _ instead of - --
      this.fileViewerList = this.fileViewerWrapper.querySelector(
        "#upfile__fileviewer_item_list",
      );
      this.fileViewerOriginalRow = this.fileViewerList.querySelector(
        ".upfile__fileviewer_item_row",
      );
      this.fileViewerTrashIcon = this.fileViewerList.querySelector(
        ".upfile__fileviewer_trash_icon",
      );
      this.fileViewerStatus = this.fileViewerList.querySelector(
        ".upfile__fileviewer_item_status",
      );

      this.fileViewerLoadingSpinner =
        this.fileViewerList.querySelector(".upfile__spinner");

      this.fileViewerPlaceholder = this.fileViewerList.querySelector(
        "#upfile__fileviewer_placeholder",
      );
      this.fileViewerErrorList = this.fileViewerWrapper.querySelector(
        "#upfile__fileviewer_error_list",
      );
      this.fileViewerErrorItem = this.fileViewerWrapper.querySelector(
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
      this.SHOPIFY_APP_PROXY_URL = this.dropzoneForm?.dataset.proxyUrl || "";

      // *Load settings and init Event Listeners:
      this.getMerchantSettings();
      this.initEventListeners();
    } else {
      const dropzoneNotice = this.dropzoneForm?.querySelector(
        "#upfile__missing_block_notice",
      );
      if (dropzoneNotice) {
        dropzoneNotice.style.display = "flex";
        this.dropzoneForm.firstElementChild.style.display = "none"; // remove other content
      }
      const fileViewerNotice = this.fileViewerWrapper?.querySelector(
        "#upfile__missing_block_notice",
      );
      if (fileViewerNotice) {
        fileViewerNotice.style.display = "flex";
        this.fileViewerWrapper.firstElementChild.style.display = "none"; // remove other content
      }
    }
  }

  // *State
  addFileState(fileId, file) {
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

  updateFileStatus(id, status) {
    if (!Object.hasOwn(this.fileStateObj, id)) {
      console.error(`File with id: ${id} does not exist in state`);
      return false;
    } else {
      const itemStatus =
        status === "fulfilled" || status === "success" ? "success" : "failed";

      // state
      this.fileStateObj[id] = {
        ...this.fileStateObj[id],
        status: itemStatus,
      };

      // update row/item status
      const statusEl = this.fileViewerUIMap
        .get(id)
        .querySelector("[data-status]");

      statusEl.textContent = itemStatus;
      statusEl.dataset.status = itemStatus;

      return true;
    }
  }

  deleteFileState(id) {
    // subtract SIZE
    this.totalStateFileSize -= this.fileStateObj[id].size; // ! adjust size FIRST

    // delete el from Set
    this.fileNameSet.delete(this.fileStateObj[id].name);

    // update state
    const { [id]: _, ...newFileStateObj } = this.fileStateObj;
    this.fileStateObj = newFileStateObj;

    // delete el from Map
    this.fileViewerUIMap.delete(id);
  }

  addVariantProps(id) {
    console.log("id:", id);
    this.hiddenInput = this.productForm?.querySelector(
      "input[name='properties[__upfile_id]']",
    );
    // assign the hidden input if it doesn't exist
    if (!this.hiddenInput) {
      this.hiddenInput = document.createElement("input");
      this.hiddenInput.type = "hidden";
      this.hiddenInput.name = "properties[__upfile_id]";
      this.hiddenInput.value = id;
      this.productForm.appendChild(this.hiddenInput); // inject into product form
    } else {
      this.hiddenInput.value += `,${id}`;
    }
    console.log("this.hiddenInput:", this.hiddenInput);
  }

  deleteVariantProps(fileId) {
    if (this.hiddenInput) {
      console.log("this.hiddenInput.value:", this.hiddenInput.value);
      const updatedValue = this.hiddenInput.value
        .split(",")
        .filter((id) => id !== fileId)
        .join(",");
      this.hiddenInput.value = updatedValue;
      console.log("this.hiddenInput.value:", this.hiddenInput.value);
    }
  }

  // *Utility
  validateSubmittedFile(file) {
    console.log("file:", file);

    if (!Object.hasOwn(this.VALID_FILE_TYPES_OBJ, file.type)) {
      this.errorMessages.push(
        `'${file.name}' \n is an invalid file type: (${file.type})`,
      );
    }
    if (file.size > this.MAX_FILE_SIZE) {
      console.log("file.size:", file.size);

      this.errorMessages.push(
        `'${file.name}' exceeds the maximum size limit per file by: \n ${this.formatToByteStr(file.size - this.MAX_FILE_SIZE)}`,
      );
    }
    if (this.fileNameSet.has(file.name)) {
      this.errorMessages.push(`'${file.name}' \n is a DUPLICATE file name`);
    }
    if (this.totalStateFileSize + file.size > this.MAX_REQUEST_SIZE) {
      this.errorMessages.push(
        `'${file.name}' \n exceeds the combined permitted submission size`,
      );
    }

    if (this.errorMessages.length > 0) {
      console.log("this.errorMessages:", this.errorMessages);
      return false;
    }
    return true;
  }

  validateDraggedFile(file) {
    if (Object.hasOwn(this.VALID_FILE_TYPES_OBJ, file.type)) {
      return true;
    } else {
      return false;
    }
  }

  formatToByteStr(byteSize) {
    let size = byteSize;
    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  prepareForFileUpload(file, i, form) {
    const fileId = crypto.randomUUID();
    // state:
    this.addFileState(fileId, file);
    // form:
    form.append("file_uuid", fileId);
    form.append("files", file);
    // ui:
    this.renderFileViewerSpinners(fileId, i);
  }

  // *UI
  togglePlaceholderUI() {
    if (this.fileViewerUIMap.size === 0) {
      this.fileViewerPlaceholder.style.display = "flex";
    }
    if (this.fileViewerUIMap.size === 1) {
      this.fileViewerPlaceholder.style.display = "none";
    }
    // otherwise, do nothing
  }

  renderFileViewerItem(fileObj) {
    let newRowEl = this.fileViewerOriginalRow.cloneNode(true);
    // update data:
    newRowEl.dataset.id = fileObj.id;
    newRowEl.querySelector("[data-type]").textContent =
      this.VALID_FILE_TYPES_OBJ[fileObj.type];
    newRowEl.querySelector("[data-name]").textContent = fileObj.name;
    newRowEl.querySelector("[data-size]").textContent = this.formatToByteStr(
      fileObj.size,
    );
    const trashEl = newRowEl.querySelector("[data-trash]");
    trashEl.dataset.id = fileObj.id;

    // Handle Delete:
    trashEl.addEventListener("click", (ev) => {
      this.handleFileDelete(ev.target.dataset.id);
    });

    // add to DOM:
    this.fileViewerList.appendChild(newRowEl);

    // make visible:
    newRowEl.style.display = "grid";
    newRowEl.style.opacity = 1;

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
    this.dropzoneForm.removeAttribute("data-status");
    this.dropzoneForm.removeAttribute("data-drag");
    this.dropzoneText.removeAttribute("data-status");
  }

  hideLoadingSpinner(fileId) {
    this.fileViewerList.querySelector(`[data-id="${fileId}"]`).style.display =
      "none";
  }

  renderFileViewerSpinners(fileId, i) {
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

  renderErrorMessages() {
    this.fileViewerErrorList.style.display = "flex";

    this.errorMessages.forEach((message, i) => {
      let newErrItem = this.fileViewerErrorItem.cloneNode(true);
      newErrItem.style.display = "flex"; // make visible
      newErrItem.textContent = message; // add text

      this.fileViewerErrorList.appendChild(newErrItem);

      setTimeout(() => {
        // check if it's still there:
        if (newErrItem.parentNode === this.fileViewerErrorList) {
          this.fileViewerErrorList.removeChild(newErrItem);
          this.fileViewerErrorList.style.display = "none";
        }
      }, 5000);
    });
  }

  resetErrorMessageList() {
    this.errorMessages = [];
    this.fileViewerErrorList.innerHTML = "";
  }

  // TODO: should be a method to "lock" the functionality and request a page refresh in case information wasn't retrieved from the server or an error occurs...?

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

      if (response.ok) {
        const data = await response.json();
        console.log("data:", data);
        // TODO: probably should just 'freeze' the app and prevent any requests if there's no data here:
        this.VALID_FILE_TYPES_OBJ = data.fileTypeMap || [];
        this.MAX_FILE_SIZE = data.maxFileSize;
        this.MAX_REQUEST_SIZE = data.maxRequestSize;
        this.MAX_FILE_COUNT = data.maxFileCount;

        // *update ui - instantiate the tally tracker text content::
        this.dropzoneFileSizeTally.textContent = this.totalStateFileSize;
        this.dropzoneFileSizeMax.textContent = this.formatToByteStr(
          this.MAX_REQUEST_SIZE,
        );
      }
    } catch (error) {
      console.error("getMerchantSettings()", error);
      return null;
    }
  }

  async postFiles(files) {
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

      validFilesArr.forEach((file, i) => {
        this.prepareForFileUpload(file, i, validatedFormData);
      });

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
        console.log("data:", data);
        data.forEach(({ value, status }) => {
          this.handleFileAdd(value, status);
        });
      }
    } catch (error) {
      console.error("postFiles():", error);
    }
  }

  async deleteFiles(files) {
    // ! Optimistic UI
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
        data.forEach((file) => {
          if (file.status !== "fulfilled") {
            console.error(`There was a server error in deleting file: ${file}`);
          }
        });
      }
    } catch (error) {
      console.error("postFiles():", error);
    }
  }

  // *Events/Handlers:
  initEventListeners() {
    this.dropzoneForm.addEventListener(
      "dragenter",
      this.handleDragEnter.bind(this),
    );
    this.dropzoneForm.addEventListener("dragover", (ev) => {
      ev.preventDefault();
    });
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

  handleFileAdd(value, status) {
    this.renderFileViewerItem(this.fileStateObj[value.id]);
    if (this.updateFileStatus(value.id, status)) {
      this.addVariantProps(value.id);
      this.updateTallyElementText();
    }
  }

  handleFileDelete(id) {
    this.deleteVariantProps(id); // props
    this.deleteFileViewerItem(id); // ui
    this.deleteFileState(id); // size, set, state, map
    this.updateTallyElementText(); // ui
    this.errorMessages = []; // reset
    this.togglePlaceholderUI(); // ui
    this.deleteFiles([id]); // fetch
  }

  handleDragEnter(ev) {
    ev.preventDefault();
    this.dropzoneForm.setAttribute("data-drag", "dragging");
    for (const item of ev.dataTransfer.items) {
      if (this.validateDraggedFile(item)) {
        this.dropzoneForm.setAttribute("data-status", "valid");
        this.dropzoneText.setAttribute("data-status", "valid");
      } else {
        this.dropzoneForm.setAttribute("data-status", "invalid");
        this.dropzoneText.setAttribute("data-status", "invalid");
      }
    }
  }

  handleDragLeave(ev) {
    ev.preventDefault();
    this.resetDragUI();
  }

  handleDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.resetDragUI();
    this.postFiles(Array.from(ev.dataTransfer.files));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let fileUpload;
  if (!fileUpload) {
    fileUpload = new FileUpload();
  }
});
