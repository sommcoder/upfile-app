document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector('[data-type="add-to-cart-form"]');

  const manualFileInputEl = document.querySelector("#manual-file-input");

  const selectFileBtn = document.querySelector("#select-file-btn");

  console.log("selectFileBtn:", selectFileBtn);
  console.log("manualFileInputEl:", manualFileInputEl);
  console.log("form:", form);

  if (!form) {
    // TODO: create some error handling here perhaps
    return;
  }
  // dropzone elements:
  const dropzoneWrapper = document.querySelector(".dropzone-wrapper");
  const dropzoneText = document.querySelector(".dropzone-text");
  const inputEl = document.querySelector(".cust-attribute-image-id");

  // fileview elements:
  const fileViewer = document.querySelector(".fileviewer-input");

  // This is SHOPIFY's proxy URL. Client requests go here and then Shopify will query OUR server:
  const APP_PROXY_URL =
    "https://custom-component-portfolio.myshopify.com/apps/dropzone";

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  console.log("fileViewer:", fileViewer);
  console.log("APP_PROXY_URL:", APP_PROXY_URL);
  // ! STATE
  // null = nothing renders, true and false have their own views:
  // type is the file type(s) that are invalid
  const fileState = {
    allValid: null,
    types: [],
  };

  const setFileValid = () => {};

  // ! should make this a setting for the app block
  const VALID_FILES = [
    "application/pdf",
    "image/png",
    "image/jpg",
    "image/jpeg",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "svg", // will this work?
  ];

  /*
  ! Validation Settings:
  - Maybe these settings are best to be in the Settings 
  - The app block should just include UI settings:
      - Drag and Drop or Upload Button? Not sure if this needs to be a separate component or can just be a settings switch.
      - colors
      - text
      - error text
      - error color
      - allow for CSS modifications
      - icons. should provide defaults but allow for merchant to add content/files URL
            - error icon
            - success icon
            - default icon
   - Also need a way to EMBED the submitted file into the product page. Perhaps we need another theme block for that..? Also some customization like sizing
      - if it's an image, show image, if its a file, some sort of generic file with the name of the file dynamically added to it.
  */

  const handleDragEnter = (ev) => {
    ev.preventDefault();
    console.log("ENTER");

    // Add some client-side validation UI feedback:
    for (const item of ev.dataTransfer.items) {
      console.log("item.type:", item.type);
      if (VALID_FILES.includes(item.type)) {
        setFileValid({ type: [item.type], valid: true });
        dropzoneWrapper.classList.add("valid", "dragging");
        dropzoneText.classList.add("valid");
      } else {
        setFileValid({ type: [item.type], valid: false });
        dropzoneWrapper.classList.add("invalid", "dragging");
        dropzoneText.classList.add("invalid");
      }
    }
  };

  const handleDragLeave = (ev) => {
    ev.preventDefault();
    console.log("LEAVE");

    // setDrag(false); // no longer dragging
    setFileValid({ type: [], valid: null });

    dropzoneWrapper.classList.remove("valid", "invalid", "dragging");
    dropzoneText.classList.remove("valid", "invalid");
    // return to null state
  };

  const handleDrop = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    console.log("DROP");
    console.log("ev.target:", ev.target);

    // setDrag(false);

    const files = Array.from(ev.dataTransfer.files);

    handleFileInput(files);
  };

  const handleFileInput = async (files) => {
    // TODO: what about handling files added in succession??? One and then another type of thing
    // filter for the valid files in the array of files:
    const validFilesArr = files.filter((file) => {
      console.log("file:", file);
      return VALID_FILES.includes(file.type) && file.size <= MAX_FILE_SIZE;
    });

    // is defined and length is greater than 1
    if (validFilesArr && validFilesArr.length > 0) {
      // ! make API call:
      console.log("validFilesArr:", validFilesArr);

      const formData = new FormData();

      validFilesArr.forEach((file, i) => {
        formData.append("files", file); // this key will be used on the server
      });

      // ! HOW DO WE add a specified MAX permitted file size here?
      // TODO: need to add clientside validation here!
      // We should render a little file icon with the first 10-15 characters of the file name with ... and the file extension below it

      // change styling first so that we're not waiting on the request!
      // ! would be a good time to implement a loading spinner
      dropzoneWrapper.classList.remove("valid", "invalid");
      dropzoneText.classList.remove("valid", "invalid");

      const response = await fetch(APP_PROXY_URL, {
        method: "POST",
        redirect: "manual",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: formData,
      }).catch((error) => {
        console.log("error.message:", error.message);
      });

      if (response.ok) {
        const data = await response.json();
        const uuidStr = data.files.map(({ id }) => id).join(",");

        let hiddenInput = document.querySelector(
          "input[name='properties[__file_id]']",
        );

        if (!hiddenInput) {
          // If it doesn't exist, create the hidden input
          hiddenInput = document.createElement("input");
          hiddenInput.type = "hidden";
          hiddenInput.name = "properties[__file_id]"; // __ = private property
          hiddenInput.value = uuidStr; // Set the initial value if it's being created
          form.appendChild(hiddenInput);
          console.log("hiddenInput:", hiddenInput);
        } else {
          // If it exists, append the new uuidStr to the existing value
          hiddenInput.value += `,${uuidStr}`;
          console.log("Appended uuidStr to hiddenInput:", hiddenInput);
        }
      }
    }
  };

  const displayFileIcons = () => {};

  // ! EVENT LISTENERS
  dropzoneWrapper.addEventListener("dragenter", handleDragEnter);
  // ! This is needed to override the documents native body event handler. Both dragover and drop events are needed on an element to make it 'droppable'
  dropzoneWrapper.addEventListener("dragover", (ev) => {
    ev.preventDefault();
  });
  dropzoneWrapper.addEventListener("dragleave", handleDragLeave);
  dropzoneWrapper.addEventListener("drop", handleDrop);

  selectFileBtn.addEventListener("click", (event) => {
    event.preventDefault();
    console.log("event:", event);
    manualFileInputEl.click(); // triggers an input click
  });
  manualFileInputEl.addEventListener("change", function (event) {
    const addedFiles = event.target.files;
    console.log("Files added:", addedFiles);
    const fileArr = Array.from(addedFiles);
    handleFileInput(fileArr);
  });

  console.log("new 24");
});

/*
 ! TEST: item properties are in the cart


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
