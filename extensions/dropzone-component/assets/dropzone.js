document.addEventListener("DOMContentLoaded", () => {
  // dropzone elements:
  const dropzoneWrapper = document.querySelector(".dropzone-wrapper");
  const dropzoneText = document.querySelector(".dropzone-text");
  const inputEl = document.querySelector(".cust-attribute-image-id");

  // fileview elements:
  const fileViewer = document.querySelector(".fileviewer-input");

  console.log("fileViewer:", fileViewer);

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
        setFileValid({ type: [], valid: true });
        dropzoneWrapper.classList.add("valid");
        dropzoneText.classList.add("valid");
      } else {
        setFileValid({ type: [item.type], valid: false });
        dropzoneWrapper.classList.add("invalid");
        dropzoneText.classList.add("invalid");
      }
      // setDrag(true);
    }
  };

  const handleDragLeave = (ev) => {
    ev.preventDefault();
    console.log("LEAVE");

    // setDrag(false); // no longer dragging
    setFileValid({ type: [], valid: null });
    dropzoneWrapper.classList.remove("valid", "invalid");
    dropzoneText.classList.remove("valid", "invalid");
    // return to null state
  };

  const handleDrop = async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    console.log("DROP");
    console.log("ev.target:", ev.target);

    // setDrag(false);
    const files = Array.from(ev.dataTransfer.files);
    // filter for the valid files in the array of files:
    const validFilesArr = files.filter((file) => {
      return VALID_FILES.includes(file.type);
    });

    // is defined and length is greater than 1
    if (validFilesArr && validFilesArr.length > 0) {
      // ! make API call:
      console.log("validFilesArr:", validFilesArr);

      const formData = new FormData();

      validFilesArr.forEach((file, i) => {
        formData.append("files", file); // this key will be used on the server
      });

      for await (const item of formData.entries()) {
        console.log("item:", item);
      }

      console.log("formData.getAll('files'):", formData.getAll("files"));
      // apparently using formData in the body makes the browser set the headers to multipart/form-data automatically!
      // Send the files to the server

      // ! HOW DO WE add a specified MAX permitted file size here?

      // The app proxy will be our URL (or a fake checkout UI extension URL) +

      // https://{URL}/apps/dropzone-files
      // any path in the installed online store after the above will be PROXIED to the provided proxy URL

      // change styling first so that we're not waiting on the request!
      // ! would be a good time to implement a loading spinner
      dropzoneWrapper.classList.remove("valid", "invalid");
      dropzoneText.classList.remove("valid", "invalid");

      const response = await fetch(
        "https://custom-component-portfolio.myshopify.com/apps/dropzone",
        {
          method: "POST",
          redirect: "manual",
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: formData,
        },
      );
      // console.log("response:", response);

      // if (response.ok) {
      //   const { fileId } = await response.json();

      //   console.log("fileId:", fileId);

      const propertyInput = document.createElement("input");
      console.log("propertyInput:", propertyInput);
      propertyInput.type = "hidden";
      propertyInput.name = "properties[file-id]";
      // give it the value of the id that to query the file from our DB
      // propertyInput.value = fileId;
      propertyInput.value = "1234";
      // add input field to product form. search for 'closest' to allow for some theme flexibility
      // ! dropzone NEEDS to be a child of the product form still
      const productForm = document.querySelector(".product-form form");
      console.log("productForm:", productForm);
      productForm.appendChild(propertyInput);
      // We also need to account for if the user clicks the Express Checkout buttons. Soo we'd need to add attributes to the other form JUST in case

      // maybe we cache the file in the browser in localStorage and get it when the user redirects to the cart?
    }
  };

  // ! EVENT LISTENERS
  dropzoneWrapper.addEventListener("dragenter", handleDragEnter);
  // This is needed to override the documents native body event handler. Both dragover and drop events are needed on an element to make it 'droppable'
  dropzoneWrapper.addEventListener("dragover", (ev) => {
    ev.preventDefault();
  });
  dropzoneWrapper.addEventListener("dragleave", handleDragLeave);
  dropzoneWrapper.addEventListener("drop", handleDrop);
});
