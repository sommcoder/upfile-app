class FileUpload {
  constructor() {
    // fileviewer elements:
    this.fileViewerList = document.querySelector(".fileviewer--item-list");
    this.fileViewerPlaceholder = document.querySelector(
      ".fileviewer--placeholder",
    );

    if (!this.fileViewerList) {
      const errorMessage = document.createElement("span");
      errorMessage.textContent =
        "Add fileviewer block to product form and refresh page";
      document.body.appendChild(errorMessage); // or another parent element
      throw new Error("Fileviewer block not found");
    }

    // TODO: eventually move this to the load settings method:
    // get the liquid generated data on the fileviewer list el:
    this.primaryColor = this.fileViewerList.getAttribute("data-primary");
    this.secondaryColor = this.fileViewerList.getAttribute("data-secondary");
    this.fontColor = this.fileViewerList.getAttribute("data-font");
    this.progressColor = this.fileViewerList.getAttribute("data-progress");
    this.deleteIcon = this.fileViewerList.getAttribute("data-delete-icon");

    // console.log("this.primaryColor:", this.primaryColor);
    // console.log("this.secondaryColor:", this.secondaryColor);
    // console.log("this.progressColor:", this.progressColor);
    // console.log("this.fontColor:", this.fontColor);
    // console.log("this.deleteIcon:", this.deleteIcon);

    // dropzone elements:
    this.form = document.querySelector('[data-type="add-to-cart-form"]');
    this.manualFileInputEl = document.querySelector("#manual-file-input");
    this.selectFileBtn = document.querySelector("#select-file-btn");
    this.dropzoneWrapper = document.querySelector(".dropzone-wrapper");
    this.dropzoneText = document.querySelector(".dropzone-text");

    // state (dynamic):
    this.fileState = { allValid: null, types: [] };
    this.fileSubmitted = false;
    this.fileStateObj = {};
    this.uploadedBytes = 0;

    // props (static):
    this.SHOPIFY_APP_PROXY_URL =
      "https://custom-component-portfolio.myshopify.com/apps/dropzone";
    this.chunkSize = 1024 * 1024; // 1MB (or adjust as needed)
    this.MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

    // functions:
    this.initializeEventListeners();
    // might be OTHER settings besides file types that we'd want:
    // this.loadMerchantSettings();
    this.VALID_FILE_TYPES = {
      "application/acad": ".dwg",
      "image/x-dwg": ".dwg",
      "image/x-dxf": ".dxf",
      "drawing/x-dwf": ".dwf",
      "model/iges": ".iges",
      "model/step": ".step",
      "model/stl": ".stl",
      "model/3mf": ".3mf",
      "model/gltf+json": ".gltf",
      "model/gltf-binary": ".glb",
      "model/obj": ".obj",
      "model/vnd.collada+xml": ".dae",
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/svg+xml": ".svg",
      "image/webp": ".webp",
      "image/bmp": ".bmp",
      "image/tiff": ".tiff",
      "text/plain": ".txt",
      "text/css": ".css",
      "application/sla": ".sla",
      "application/x-amf": ".amf",
      "application/x-gcode": ".gcode",
      "application/pdf": ".pdf",
      "application/json": ".json",
      "application/xml": ".xml",
      "application/zip": ".zip",
      "application/x-tar": ".tar",
      "application/gzip": ".gz",
      "application/x-7z-compressed": ".7z",
      "application/x-rar-compressed": ".rar",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
      "application/vnd.ms-powerpoint": ".ppt",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        ".pptx",
      "audio/mpeg": ".mp3",
      "audio/ogg": ".ogg",
      "video/mp4": ".mp4",
      "video/x-msvideo": ".avi",
      "video/webm": ".webm",
      "application/x-font-ttf": ".ttf",
      "application/x-font-otf": ".otf",
      "application/vnd.ms-fontobject": ".eot",
      "application/x-font-woff": ".woff",
      "application/x-font-woff2": ".woff2",
      "application/x-apple-diskimage": ".dmg",
      "application/mac-binhex40": ".hqx",
      "application/x-apple-property-list": ".plist",
    };
    console.log("this.VALID_FILE_TYPES:", this.VALID_FILE_TYPES);
  }

  // State Updates:
  // there is only add, remove, no update!
  addFile(id, file) {
    if (!file) return;

    this.fileStateObj = {
      ...this.fileStateObj, // Spread existing state
      [id]: {
        type: file.type,
        name: file.name,
        size: file.size,
      },
    };
    console.log("File added!", this.fileStateObj);
  }

  // want this to work for removeAll functionality too!
  removeFile(id) {
    if (!this.fileStateObj[id]) return;
    const { [id]: _, ...newFileStateObj } = this.fileStateObj;
    this.fileStateObj = newFileStateObj;

    console.log("File removed!", this.fileStateObj);
  }

  // DOM/UI Updates
  validateSubmittedFiles(files) {
    console.log("files:", files);
    const validFilesArr = files.filter(
      (file) =>
        Object.hasOwn(this.VALID_FILE_TYPES, file.type) &&
        file.size <= this.MAX_FILE_SIZE,
    );
    if (validFilesArr.length < 1) {
      // render an error on screen
      // "no valid files"
    }

    this.dropzoneWrapper.classList.remove("valid", "invalid");
    this.dropzoneText.classList.remove("valid", "invalid");
    return validFilesArr;
  }

  hidePlaceholder() {
    this.fileViewerPlaceholder.style.display = "none";
  }

  // TODO: will probably need an identify data id for each element to remove them when a user clicks delete with the same data attribute
  addFileViewerItem(fileId, file) {
    const newRowEl = document.createElement("span");
    newRowEl.className = "fileviewer--item-row";
    newRowEl.dataset.id = fileId;
    newRowEl.innerHTML = `
 <span class="fileviewer--left-section">
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

    <span class="fileviewer--item-type" style="color: ${this.fontColor}"
      >${this.VALID_FILE_TYPES[file.type]}</span
    >
  </span>

  <span class="fileviewer--center-section">
    <div class="fileviewer--center-upper">
      <span class="fileviewer--item-name">${file.name}</span>
      <span class="fileviewer--item-size"
        >${this.getFileFormatString(file.size)}</span
      >
    </div>
    <div class="fileviewer--center-lower">
      <span class="fileviewer--progress-bar-wrapper">
        <span
          class="fileviewer--progress-bar-completion"
          style="background-color: ${this.progressColor};"
        ></span>
      </span>
      <span class="fileviewer--progress-completion-percentage">
        ${this.progress}
      </span>
    </div>
  </span>

  <span class="fileviewer--right-section">
    <img
      class="fileviewer--trash-icon"
      data-id="${fileId}"
      src="${this.deleteIcon}"
      height="15px"
      width="15px"
    />
  </span>
`;

    // Append new row to file viewer list
    this.fileViewerList.insertAdjacentElement("beforeend", newRowEl);

    // Add event listener for remove button
    newRowEl
      .querySelector(".fileviewer--trash-icon")
      .addEventListener("click", () => {
        this.removeRowFromList(fileId);
      });

    this.hidePlaceholder();
  }

  removeRowFromList(fileId) {
    //
  }

  async handleFileInput(files) {
    const validFilesArr = this.validateSubmittedFiles(files);

    // TODO: showLoadingSpinner()
    console.log("validFilesArr:", validFilesArr);
    // prep the
    const formData = new FormData();

    // TODO: this could be a render function:
    validFilesArr.forEach((file) => {
      console.log("file:", file);
      // Store file details in an object
      const fileId = crypto.randomUUID();

      // update state:
      this.fileStateObj[fileId] = {
        name: file.name,
        size: file.size,
        type: file.type,
        status: null, // status will come from the response
        progress: 0, // Start at 0% progress
      };
      // ! Testing adding UUID on client and sending it in the request.

      console.log("formData:", formData);
      formData.append("file_uuid", fileId); // Attach UUID
      formData.append("files", file);

      // Create UI representation:
      this.addFileViewerItem(fileId, file);
    });

    try {
      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/file`, {
        method: "POST",
        redirect: "manual",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const uuidStr = data.files.map(({ id }) => id).join(",");
        console.log("uuidStr:", uuidStr);
        this.updateVariantProperties(uuidStr);
        // TODO: hideLoadingSpinner()
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  }

  async handleFileDeletion(file) {
    // handle an individual file deletion
    // remove from private properties,
    // remove from local state
    // DELETE request to server to remove from db
  }

  updateVariantProperties(uuidStr) {
    let hiddenInput = document.querySelector(
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

  setFileValid({ type, valid }) {
    this.fileState.types = type;
    this.fileState.allValid = valid;
  }

  // Util/Formatting:
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

  // load all of the settings that the app block needs:
  async loadMerchantSettings() {
    // return null;
    const FILE_TYPE_SETTINGS_KEY = "filedropz_permitted_file_types";
    const FILE_TYPE_EXPIRY_KEY = "filedropz_permitted_file_types_expiry";
    const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours

    // Check localStorage for cached settings
    const cachedSettings = localStorage.getItem(FILE_TYPE_SETTINGS_KEY);
    const cachedExpiry = localStorage.getItem(FILE_TYPE_EXPIRY_KEY);
    const now = Date.now();

    if (cachedSettings && cachedExpiry && now < parseInt(cachedExpiry, 10)) {
      return JSON.parse(cachedSettings);
    }

    try {
      // Fetch from the app proxy
      const response = await fetch(`${this.SHOPIFY_APP_PROXY_URL}/merchant`, {
        method: "GET",
        redirect: "manual",
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
      return data.fileTypeMap;
    } catch (error) {
      console.error("Upload error:", error);
      // Handle the error (you could return a fallback or empty settings, etc.)
      return null;
    }
  }

  initializeEventListeners() {
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
      this.handleFileInput(fileArr);
    });
  }

  // Event Handlers:
  handleDragEnter(ev) {
    ev.preventDefault();
    // TODO: something is wrong with how we're handling the UI state since I refactored the code
    for (const item of ev.dataTransfer.items) {
      console.log("item:", item);
      console.log("item.type:", item.type);
      if (Object.hasOwn(this.VALID_FILE_TYPES, item.type)) {
        this.setFileValid({ type: [item.type], valid: true });
        this.dropzoneWrapper.classList.add("valid", "dragging");
        this.dropzoneText.classList.add("valid");
      } else {
        this.setFileValid({ type: [item.type], valid: false });
        this.dropzoneWrapper.classList.add("invalid", "dragging");
        this.dropzoneText.classList.add("invalid");
      }
    }

    console.log("this.fileState:", this.fileState);
    console.log("this.dropzoneWrapper:", this.dropzoneWrapper);
  }

  handleDragLeave(ev) {
    ev.preventDefault();
    this.setFileValid({ type: [], valid: null });
    this.dropzoneWrapper.classList.remove("valid", "invalid", "dragging");
    this.dropzoneText.classList.remove("valid", "invalid");

    console.log("this.fileState:", this.fileState);
    console.log("this.dropzoneWrapper:", this.dropzoneWrapper);
  }

  handleDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.handleFileInput(Array.from(ev.dataTransfer.files));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FileUpload();
  console.log("8");
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
