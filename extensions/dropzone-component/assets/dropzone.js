/**
 * * DropZone Component:
 *  @Use add to top of a component's JSX to enable dropZone functionality for file submissions for the parent component
 *  @state needs parent's setData() passed down. This function is UNIQUE to the parent and is the handler function that gets called and whatever data DropZone processes is passed to it.
 *  @style Drop Zone inherits dimensions from it's parent and extends slightly beyond them.
 *  @parentType enum: 'Table' or 'Page'.
 *  @parentComp can be a Page or Table.
 */

/*
 

! Template parent = submitFiles

! Table parent = may not need a server query..? onMount the Page will fetch what it needs and pass to the Table and therefore Dropzone. So when files are dropped on a Table DropZone, we could just use the Table Template, whatever it is, to populate the table. 
 
*/

// // returns nothing, error or a FileListArray
// const { mutate, data } = useMutation({
//   mutationKey: ["submitFiles"],
//   mutationFn: (fileListArr: FileListArray) => submitFiles(fileListArr),
//   onSuccess: () => {
//     console.log("React Query: Your file was successfully uploaded");
//   },
// });
// ! though the IDE is indicating an error, this is in fact being received from our liquid file that contains ANOTHER script that declares these variables
// console.log("ERROR_BG_COLOR:", ERROR_BG_COLOR);
// console.log("VALID_BG_COLOR:", VALID_BG_COLOR);
// console.log("application_url:", application_url);
// console.log("APP_URL:", APP_URL);
// const [progress, setProgress] = useState({ started: false, pc: 0 });
// ! ELEMENTS

document.addEventListener("DOMContentLoaded", () => {
  const dropzoneWrapper = document.querySelector(".dropzone-wrapper");
  const dropzoneText = document.querySelector(".dropzone-text");

  console.log("dropzoneWrapper:", dropzoneWrapper);
  console.log("dropzoneText:", dropzoneText);

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

  const handleDrop = (ev) => {
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

      validFilesArr.forEach((file) => {
        formData.append(file.name, file);
      });

      console.log("formData:", formData);

      // apparently using formData in the body makes the browser set the headers to multipart/form-data automatically!
      // Send the files to the server
      fetch(
        "https://titled-katrina-task-automatically.trycloudflare.com/files",
        {
          method: "POST",
          body: formData,
        },
      )
        .then((res) => {
          console.log("res:", res);
          res.json();
        })
        .then((data) => {
          console.log("File upload successful:", data);
        })
        .catch((error) => {
          console.error("Error uploading files:", error);
        });
    }

    dropzoneWrapper.classList.remove("valid", "invalid");
    dropzoneText.classList.remove("valid", "invalid");
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
