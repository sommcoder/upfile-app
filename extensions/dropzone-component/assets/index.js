class FileUpload {
  constructor() {
    // fileviewer elements:
    this.fileViewerList = document.getElementById(
      "upfile__fileviewer--item-list",
    );
    this.fileViewerOriginalRow = document.getElementById(
      "upfile__fileviewer--item-row",
    );
    // TODO maybe I just add them via the Item Row element?
    // this.fileViewerPlaceholder = document.getElementById(
    //   "upfile__fileviewer--placeholder",
    // );
    // this.fileViewerType = document.getElementById(
    //   "upfile__fileviewer--item-type",
    // );
    // this.fileViewerName = document.getElementById(
    //   "upfile__fileviewer--item-name",
    // );
    // this.fileViewerSize = document.getElementById(
    //   "upfile__fileviewer--item-size",
    // );
    // TODO: add value to data-id attribute:
    this.fileViewerPlaceholder = document.getElementById(
      "upfile__fileviewer--trash-icon",
    );
    // TODO: add later:
    this.fileViewerPlaceholder = document.getElementById(
      "upfile__fileviewer--item-status",
    );
    // TODO: need to test this. Definitely will need styling
    if (!this.fileViewerList) {
      const errorMessage = document.createElement("span");
      errorMessage.textContent =
        "Add fileviewer block to product form and refresh page";
      document.body.appendChild(errorMessage); // or another parent element
      throw new Error("Fileviewer block not found");
    }
    // Liquid generated data on the fileviewer list element:
    // TODO: would be great to detect if
    // dropzone elements:
    this.formEl = document.querySelector('[data-type="add-to-cart-form"]');
    this.manualFileInputEl = document.getElementById(
      "upfile__manual-file-input",
    );
    this.selectFileBtn = document.getElementById("upfile__select-file-btn");
    this.dropzoneWrapperEl = document.getElementById(
      "upfile__dropzone-wrapper",
    );
    this.dropzoneTextEl = document.getElementById("upfile__dropzone-text");
    this.toastContainerEl = document.getElementById("upfile__toast-container");
    this.toastTextEl = this.toastContainerEl.firstElementChild();
    console.log("this.toastTextEl:", this.toastTextEl);
    // state (dynamic):
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
    this.initEventListeners();
    this.getMerchantSettings();
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

      // would be great to just have this in our CSS:
      moreToast.id = "upfile__toast-text";
      moreToast.className = "toast-message";
      moreToast.innerText = "... and more";
      moreToast.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
      moreToast.style.color = "white";
      moreToast.style.padding = "10px 20px";
      moreToast.style.borderRadius = "5px";
      moreToast.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.3)";
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
      return false;
    }

    // Check for file size limit
    if (file.size > this.MAX_FILE_SIZE) {
      errorMessages.push(`File too large: ${file.name}`);
      return false;
    }

    // Check for duplicate file names
    if (this.fileNameSet.has(file.name)) {
      errorMessages.push(`Duplicate file: ${file.name}`);
      return false;
    }

    // If there are any errors, show them:
    if (errorMessages.length > 0) {
      this.showErrorMessages(errorMessages);
    }

    this.dropzoneWrapperEl.removeAttribute("data-status");
    this.dropzoneTextEl.removeAttribute("data-status");
    return true;
  }

  getFileFormatString(byteSize) {
    let size = byteSize / 1024; // Start by converting to KB
    let unit = "KB";

    if (size >= 1024) {
      size = size / 1024;
      unit = "MB";
    }

    if (size >= 1024) {
      size = size / 1024;
      unit = "GB";
    }

    return `${size.toFixed(2)} ${unit}`;
  }

  isFileNameUnique(name) {
    if (!this.fileNameSet.has(name)) {
      // do nothing
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

    const trashEl = newRowEl.querySelector("[data-trash]");
    trashEl.dataset.id = fileId;

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
      // Fetch from the app proxy
      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/merchant`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }
      const data = await response.json();
      this.VALID_FILE_TYPES = data.fileTypeMap || [];
      return;
    } catch (error) {
      console.error("getMerchantSettings() error:", error);
      // Handle the error (you could return a fallback or empty settings, etc.)
      return null;
    }
  }

  async postFiles(files) {
    // TODO: maybe we GET the HTML from the server and send it back to the client as to reduce this file(s) size
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

  async postErrorLogs(error) {
    // TODO: I want to write errors or weird behaviour to our server to be logged in a minimal way
    const errorData = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Send asynchronously to avoid blocking user interaction
    fetch(`${this.SHOPIFY_APP_PROXY_URL}/error`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorData),
    }).catch(console.error); // Catch potential errors when sending the log
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

// class FileUpload {
//   constructor({
//     fileInput,
//     fileViewerPlaceholder,
//     fileNameDisplay,
//     fileSizeDisplay,
//     removeFileButton,
//     fileState,
//   }) {
//     this.input = fileInput;
//     this.viewer = fileViewerPlaceholder;
//     this.nameDisplay = fileNameDisplay;
//     this.sizeDisplay = fileSizeDisplay;
//     this.removeBtn = removeFileButton;
//     this.state = fileState;
//     this.maxSize = 15728640; //20MB
//     this.init();
//   }

//   init() {
//     this.input.addEventListener("change", (e) =>
//       this.handleFile(e.target.files[0]),
//     );
//     this.removeBtn.addEventListener("click", () => this.clearFile());
//   }

//   async handleFile(file) {
//     if (!file || !this.isValid(file)) return;
//     this.displayFile(file);
//     this.state.file = file;
//     await this.uploadFile(file);
//   }

//   isValid(file) {
//     if (
//       !["image/png", "image/jpeg", "image/gif", "application/pdf"].includes(
//         file.type,
//       )
//     ) {
//       alert("Invalid file type.");
//       return false;
//     }
//     if (file.size > this.maxSize) {
//       alert("File too large. Max 5MB.");
//       return false;
//     }
//     return true;
//   }

//   displayFile(file) {
//     this.nameDisplay.textContent = file.name;
//     this.sizeDisplay.textContent = (file.size / 1024).toFixed(2) + " KB";
//     this.viewer.innerHTML = file.type.startsWith("image")
//       ? `<img src="${URL.createObjectURL(file)}" alt="File preview" />`
//       : "";
//     this.removeBtn.style.display = "block";
//   }

//   async uploadFile(file) {
//     const formData = new FormData();
//     formData.append("file", file);
//     try {
//       const response = await fetch(this.uploadUrl, {
//         method: "POST",
//         body: formData,
//       });
//       const result = await response.json();
//       this.state.fileId = result.fileId;
//     } catch (error) {
//       console.error("Upload failed", error);
//     }
//   }

//   clearFile() {
//     this.input.value = "";
//     this.viewer.innerHTML = "";
//     this.nameDisplay.textContent = "";
//     this.sizeDisplay.textContent = "";
//     this.removeBtn.style.display = "none";
//     this.state.file = null;
//     this.state.fileId = null;
//   }
// }
