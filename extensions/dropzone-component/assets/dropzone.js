class FileUpload {
  constructor() {
    // fileviewer elements:
    this.fileViewerList = document.getElementById(
      "upfile__fileviewer--item-list",
    );
    this.fileViewerPlaceholder = document.getElementById(
      "upfile__fileviewer--placeholder",
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
    this.primaryColor = this.fileViewerList.getAttribute("data-primary");
    this.secondaryColor = this.fileViewerList.getAttribute("data-secondary");
    this.fontColor = this.fileViewerList.getAttribute("data-font");
    this.deleteIcon = this.fileViewerList.getAttribute("data-delete-icon");

    // dropzone elements:
    this.form = document.querySelector('[data-type="add-to-cart-form"]');
    this.manualFileInputEl = document.getElementById(
      "upfile__manual-file-input",
    );
    this.selectFileBtn = document.getElementById("upfile__select-file-btn");
    this.dropzoneWrapper = document.getElementById("upfile__dropzone-wrapper");
    this.dropzoneText = document.getElementById("upfile__dropzone-text");
    this.toastContainer = document.getElementById("upfile__toast-container");

    // state (dynamic):
    // TODO: need to rework this:
    this.fileState = { allValid: null, types: [] };
    this.canSubmit = true; // a switch to enable/disable submissions
    this.fileNameSet = new Set();
    this.fileViewerRowState = new Map(); // [key: uuid]: element;
    this.fileStateObj = {};
    /*
    this.fileStateObj[fileUUID] = {
        name: file.name;
        size: file.size;
        type: file.type;
        status: null;
      };
      file UUID can be generated on the client, saved to state and sent with the request.
    */

    // props (static):
    this.SHOPIFY_APP_PROXY_URL =
      "https://custom-component-portfolio.myshopify.com/apps/dropzone";
    this.chunkSize = 1024 * 1024; // 1MB (or adjust as needed)
    this.MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    this.VALID_FILE_TYPES = {}; // gets populated from getMerchantSettings()

    // launch functions (after elements):
    this.initEventListeners();
    this.getMerchantSettings();
  }

  // * State
  // there is only add, remove, no update!
  addFileState(fileId, file) {
    console.log("file:", file);
    // add valid files to stateObj:
    this.fileStateObj[fileId] = {
      name: file.name,
      size: file.size,
      type: file.type,
      status: null, // status will come from the response
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
    this.toastContainer.innerHTML = "";

    // Determine how many errors to display
    const maxVisibleErrors = 4;
    const errorsToShow = errMsgArr.slice(0, maxVisibleErrors);

    // Render each error message
    errorsToShow.forEach((message) => {
      const toast = document.createElement("div");
      toast.id = "upfile__toast-text";
      toast.textContent = message;
      this.toastContainer.appendChild(toast);
    });

    // Show "... and more" if there are more than 4 errors
    if (errMsgArr.length > maxVisibleErrors) {
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
      this.toastContainer.appendChild(moreToast);
    }

    // Auto-remove messages after 3 seconds
    setTimeout(() => {
      this.toastContainer.innerHTML = "";
    }, 3000);
  }

  // * validation/util:
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

    this.dropzoneWrapper.removeAttribute("data-status");
    this.dropzoneText.removeAttribute("data-status");
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
    if (this.fileNameSet.has(name)) {
      // do nothing
    } else {
      // run a visual error
      // reject the ability to drop
    }
  }

  // * DOM/UI Updates
  hideFileViewerPlaceholder() {
    this.fileViewerPlaceholder.style.display = "none";
  }

  renderFileViewerItem(fileId, file) {
    const newRowEl = document.createElement("span");
    newRowEl.id = "upfile__fileviewer--item-row";
    newRowEl.dataset.id = fileId;

    // TODO: should also add a loading spinner until we hear back from the server!
    newRowEl.innerHTML = `
 <span id="upfile__fileviewer--left-section">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="65"
      zoomAndPan="magnify"
      viewBox="0 0 375 374.999991"
      height="65"
      preserveAspectRatio="xMidYMid meet"
      version="1.0"
    >
      <defs>
        <clipPath id="bf5ac67ee2">
          <path
            d="M 52.121094 4.132812 L 324.371094 4.132812 L 324.371094 370.882812 L 52.121094 370.882812 Z M 52.121094 4.132812 "
            clip-rule="nonzero"
          ></path>
        </clipPath>
        <clipPath id="6974e8a302">
          <path
            d="M 227 4.132812 L 324.371094 4.132812 L 324.371094 102 L 227 102 Z M 227 4.132812 "
            clip-rule="nonzero"
          ></path>
        </clipPath>
        <clipPath id="9efefcb0a6">
          <path
            d="M 87.761719 135.4375 L 288.761719 135.4375 L 288.761719 336.4375 L 87.761719 336.4375 Z M 87.761719 135.4375 "
            clip-rule="nonzero"
          ></path>
        </clipPath>
      </defs>
      <g clip-path="url(#bf5ac67ee2)">
        <path
          fill="${this.primaryColor}"
          d="M 324.417969 101.484375 L 324.417969 351.871094 C 324.417969 352.488281 324.386719 353.101562 324.328125 353.714844 C 324.265625 354.328125 324.175781 354.9375 324.054688 355.542969 C 323.9375 356.148438 323.785156 356.746094 323.609375 357.335938 C 323.429688 357.925781 323.222656 358.503906 322.984375 359.074219 C 322.75 359.644531 322.484375 360.199219 322.195312 360.746094 C 321.90625 361.289062 321.589844 361.816406 321.246094 362.328125 C 320.902344 362.84375 320.535156 363.335938 320.144531 363.8125 C 319.753906 364.289062 319.339844 364.746094 318.90625 365.183594 C 318.46875 365.617188 318.011719 366.03125 317.535156 366.421875 C 317.058594 366.8125 316.5625 367.179688 316.050781 367.523438 C 315.539062 367.867188 315.011719 368.183594 314.46875 368.472656 C 313.921875 368.765625 313.367188 369.027344 312.796875 369.261719 C 312.226562 369.5 311.648438 369.707031 311.058594 369.886719 C 310.46875 370.066406 309.871094 370.214844 309.265625 370.335938 C 308.660156 370.457031 308.050781 370.546875 307.4375 370.605469 C 306.824219 370.667969 306.210938 370.695312 305.59375 370.695312 L 70.949219 370.695312 C 70.332031 370.695312 69.71875 370.667969 69.105469 370.605469 C 68.488281 370.546875 67.882812 370.457031 67.277344 370.335938 C 66.671875 370.214844 66.074219 370.066406 65.484375 369.886719 C 64.894531 369.707031 64.316406 369.5 63.746094 369.261719 C 63.175781 369.027344 62.617188 368.765625 62.074219 368.472656 C 61.53125 368.183594 61.003906 367.867188 60.492188 367.523438 C 59.976562 367.179688 59.484375 366.8125 59.007812 366.421875 C 58.53125 366.03125 58.074219 365.617188 57.636719 365.183594 C 57.203125 364.746094 56.789062 364.289062 56.398438 363.8125 C 56.003906 363.335938 55.640625 362.84375 55.296875 362.328125 C 54.953125 361.816406 54.636719 361.289062 54.347656 360.746094 C 54.054688 360.203125 53.792969 359.644531 53.558594 359.074219 C 53.320312 358.503906 53.113281 357.925781 52.933594 357.335938 C 52.753906 356.746094 52.605469 356.148438 52.484375 355.542969 C 52.367188 354.9375 52.273438 354.328125 52.214844 353.714844 C 52.152344 353.101562 52.125 352.488281 52.125 351.871094 L 52.125 23.125 C 52.125 22.507812 52.152344 21.894531 52.214844 21.28125 C 52.273438 20.664062 52.367188 20.058594 52.484375 19.453125 C 52.605469 18.847656 52.753906 18.25 52.933594 17.660156 C 53.113281 17.070312 53.320312 16.488281 53.558594 15.921875 C 53.792969 15.351562 54.054688 14.792969 54.347656 14.25 C 54.636719 13.707031 54.953125 13.179688 55.296875 12.664062 C 55.640625 12.152344 56.003906 11.660156 56.398438 11.183594 C 56.789062 10.707031 57.203125 10.25 57.636719 9.8125 C 58.074219 9.375 58.53125 8.964844 59.007812 8.570312 C 59.484375 8.179688 59.976562 7.8125 60.492188 7.472656 C 61.003906 7.128906 61.53125 6.8125 62.074219 6.523438 C 62.617188 6.230469 63.175781 5.96875 63.746094 5.730469 C 64.316406 5.496094 64.894531 5.289062 65.484375 5.109375 C 66.074219 4.929688 66.671875 4.78125 67.277344 4.660156 C 67.882812 4.539062 68.488281 4.449219 69.105469 4.390625 C 69.71875 4.328125 70.332031 4.296875 70.949219 4.296875 L 227.230469 4.296875 Z M 324.417969 101.484375 "
          fill-opacity="1"
          fill-rule="nonzero"
        ></path>
      </g>
      <g clip-path="url(#6974e8a302)">
        <path
          fill="${this.secondaryColor}"
          d="M 324.417969 101.484375 L 235.128906 101.484375 C 234.609375 101.484375 234.09375 101.4375 233.585938 101.335938 C 233.078125 101.234375 232.585938 101.082031 232.105469 100.886719 C 231.625 100.6875 231.171875 100.445312 230.742188 100.15625 C 230.308594 99.867188 229.910156 99.539062 229.542969 99.171875 C 229.175781 98.808594 228.851562 98.410156 228.5625 97.976562 C 228.273438 97.546875 228.03125 97.089844 227.832031 96.613281 C 227.632812 96.132812 227.484375 95.640625 227.382812 95.132812 C 227.28125 94.621094 227.230469 94.109375 227.230469 93.589844 L 227.230469 4.296875 Z M 324.417969 101.484375 "
          fill-opacity="1"
          fill-rule="nonzero"
        ></path>
      </g>
    </svg>

    <span id="upfile__fileviewer--item-type" style="color: ${this.fontColor}"
      >${this.VALID_FILE_TYPES[file.type]}</span>
  </span>

  <span id="upfile__fileviewer--center-section">
      <span id="upfile__fileviewer--item-name">${file.name}</span>
      <span id="upfile__fileviewer--item-size"
        >${this.getFileFormatString(file.size)}</span
      >
  </span>

  <span id="upfile__fileviewer--right-section">
    <img
      id="upfile__fileviewer--trash-icon"
      data-id="${fileId}"
      src="${this.deleteIcon}"
      height="15px"
      width="15px"
    />
  </span>
`;

    // Append new row to file viewer list
    this.fileViewerList.insertAdjacentElement("beforeend", newRowEl);

    if (!this.fileViewerRowState.has(fileId)) {
      this.fileViewerRowState.set(fileId, newRowEl);
    }
    console.log("this.fileViewerRowState:", this.fileViewerRowState);

    newRowEl
      .querySelector("#upfile__fileviewer--trash-icon")
      .addEventListener("click", (ev) => {
        console.log("ev:", ev);
        console.log("ev.target.dataset.id:", ev.target.dataset.id);
        this.removeFileViewerItem(ev.target.dataset.id);
      });

    console.log("newRowEl:", newRowEl);
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
      this.form.appendChild(hiddenInput);
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

  // * Fetch
  async getMerchantSettings() {
    // return null;
    const FILE_TYPE_SETTINGS_KEY = "filedropz_permitted_file_types";
    const FILE_TYPE_EXPIRY_KEY = "filedropz_permitted_file_types_expiry";
    const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours

    // Check localStorage for cached settings
    const cachedSettings = localStorage.getItem(FILE_TYPE_SETTINGS_KEY);
    const cachedExpiry = localStorage.getItem(FILE_TYPE_EXPIRY_KEY);
    const now = Date.now();

    if (cachedSettings && cachedExpiry && now < parseInt(cachedExpiry, 10)) {
      this.VALID_FILE_TYPES = JSON.parse(cachedSettings);
      return;
    }

    try {
      // Fetch from the app proxy
      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/merchant`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      console.log("response:", response);

      const data = await response.json();
      console.log("data:", data);

      // Assuming the response has the fileTypeMap and settings objects
      this.VALID_FILE_TYPES = data.fileTypeMap || [];
      console.log("this.VALID_FILE_TYPES:", this.VALID_FILE_TYPES);

      // Store in localStorage with an expiry timestamp
      localStorage.setItem(
        FILE_TYPE_SETTINGS_KEY,
        JSON.stringify(data.fileTypeMap),
      );
      localStorage.setItem(
        FILE_TYPE_EXPIRY_KEY,
        (now + EXPIRATION_TIME_MS).toString(),
      );

      console.log(
        "Fetched and stored new file type settings:",
        data.fileTypeMap,
      );
      this.VALID_FILE_TYPES = data.fileTypeMap;
      return;
    } catch (error) {
      console.error("Upload error:", error);
      // Handle the error (you could return a fallback or empty settings, etc.)
      return null;
    }
  }

  async postFiles(files) {
    const validFilesArr = files.filter((file) => this.validateFile(file));
    console.log("validFilesArr:", validFilesArr);

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

  // needs to be an array of files, even if just one
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

  // * Events:
  initEventListeners() {
    this.dropzoneWrapper.addEventListener(
      "dragenter",
      this.handleDragEnter.bind(this),
    );
    this.dropzoneWrapper.addEventListener("dragover", (ev) =>
      ev.preventDefault(),
    );
    this.dropzoneWrapper.addEventListener(
      "dragleave",
      this.handleDragLeave.bind(this),
    );
    this.dropzoneWrapper.addEventListener("drop", this.handleDrop.bind(this));
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

        this.dropzoneWrapper.setAttribute("data-status", "valid");
        this.dropzoneText.setAttribute("data-status", "valid");
        // TODO: add styling to the upload icon if visible
      } else {
        this.setFileValid({ type: [item.type], valid: false });
        this.dropzoneWrapper.setAttribute("data-status", "invalid");
        this.dropzoneText.setAttribute("data-status", "invalid");
      }
      // all states share dragging attribute:
      this.dropzoneWrapper.setAttribute("data-drag", "dragging");
    }
    console.log("this.fileState:", this.fileState);
    console.log("this.dropzoneWrapper:", this.dropzoneWrapper);
  }

  handleDragLeave(ev) {
    ev.preventDefault();
    this.setFileValid({ type: [], valid: null });
    // TODO: need to adjust this to and data attributes:
    this.dropzoneWrapper.removeAttribute("data-status");
    this.dropzoneText.removeAttribute("data-status");

    console.log("this.fileState:", this.fileState);
    console.log("this.dropzoneWrapper:", this.dropzoneWrapper);
  }

  handleDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.postFiles(Array.from(ev.dataTransfer.files));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FileUpload();
  console.log("7");
});

/*
 ! TEST: item properties are in the cart:


fetch('/cart.js')
  .then(response => response.json())
  .then(cart => {
    console.log('Cart Data:', cart);

    // Loop through line items in the cart
    cart.items.forEach(item => {
      console.log('Product:', item.product_title);
      console.log('Quantity:', item.quantity);

      // Loop through the custom properties (if any)
      if (item.properties) {
        Object.keys(item.properties).forEach(property => {
          console.log(`${property}: ${item.properties[property]}`);
        });
      }
    });
  })
  .catch(error => {
    console.error('Error fetching cart:', error);
  });

 
*/
