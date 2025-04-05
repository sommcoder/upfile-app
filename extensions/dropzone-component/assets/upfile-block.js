class FileUpload {
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
      this.fileViewerOriginalRow = this.fileViewerList.querySelector(
        ".upfile__fileviewer_item_row",
      );
      this.fileViewerTrashIcon = this.fileViewerList.querySelector(
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
      if (dropzoneNotice) {
        dropzoneNotice.style.display = "flex";
        this.dropzoneBlock.firstElementChild.style.display = "none"; // remove other content
      }
      const fileViewerNotice = this.fileViewerBlock?.querySelector(
        "#upfile__dropzone_missing_block_notice",
      );
      if (fileViewerNotice) {
        fileViewerNotice.style.display = "flex";
        this.fileViewerBlock.firstElementChild.style.display = "none"; // remove other content
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
  renderFileViewerSpinners(fileId, i) {
    let newSpinner;
    if (i === 0) {
      newSpinner = this.loadingSpinner;
    } else {
      newSpinner = this.loadingSpinner.cloneNode(true);
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
      const disableMaxSpinner = this.renderLoadingSpinner(this.dropzoneText);
      const disableTallySpinner = this.renderLoadingSpinner(
        this.dropzoneFileSizeTally,
      );

      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/merchant`, {
        method: "GET",
      });
      if (!response.ok) {
        this.dropzoneBlock.textContent =
          "Server Connection Issue:\n Please reload page";
        this.fileViewerBlock.textContent =
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
        disableTallySpinner();
        this.dropzoneFileSizeTally.textContent = this.totalStateFileSize;
        this.dropzoneFileSizeMax.textContent = `${this.formatToByteStr(
          this.MAX_REQUEST_SIZE,
        )} total`;
        disableMaxSpinner();
        this.dropzoneHelpText.textContent = `Max ${this.formatToByteStr(
          this.MAX_FILE_SIZE,
        )} per file`;
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
    this.dropzoneBlock.addEventListener(
      "dragenter",
      this.handleDragEnter.bind(this),
    );
    this.dropzoneBlock.addEventListener("dragover", (ev) => {
      ev.preventDefault();
    });
    this.dropzoneBlock.addEventListener(
      "dragleave",
      this.handleDragLeave.bind(this),
    );
    this.dropzoneBlock.addEventListener("drop", this.handleDrop.bind(this));
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
    this.dropzoneBlock.setAttribute("data-drag", "dragging");

    // remove button
    this.dropzoneSelectBtn.style.display = "none";
    const fileCount = ev.dataTransfer.items.length;
    console.log("fileCount:", fileCount);
    let txt;

    // TODO: why no work? textContent is <empty string>
    for (const item of ev.dataTransfer.items) {
      if (this.validateDraggedFile(item)) {
        this.dropzoneBlock.setAttribute("data-status", "valid");
        this.dropzoneText.setAttribute("data-status", "valid");

        txt =
          fileCount > 1
            ? this.dropzoneText.dataset["valid-text-plural"]
            : this.dropzoneText.dataset["valid-text-singular"];
        console.log("txt:", txt);

        this.dropzoneText.textContent = txt;
      } else {
        this.dropzoneBlock.setAttribute("data-status", "invalid");
        this.dropzoneText.setAttribute("data-status", "invalid");

        txt =
          fileCount > 1
            ? this.dropzoneText.dataset["invalid-text-plural"]
            : this.dropzoneText.dataset["invalid-text-singular"];
        console.log("txt:", txt);

        this.dropzoneText.textContent = txt;
      }
      this.dropzoneText.style.display = "flex";
      console.log(
        "this.dropzoneText.textContent:",
        this.dropzoneText.textContent,
      );
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
