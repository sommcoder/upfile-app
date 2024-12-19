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

// console.log("data:", data);

// const [progress, setProgress] = useState({ started: false, pc: 0 });

const dropzoneWrapper = document.querySelector(".dropzone-wrapper");
const dropzoneText = document.querySelector(".dropzone-text");

const dragState = false;
const setDrag = () => {
  // if true, add class, if false remove class
};

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
  "pdf",
  "png",
  "jpg",
  "jpeg",
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

const handleDragOver = (ev) => {
  ev.preventDefault();

  // client-side validation UI feedback:
  for (const item of ev.dataTransfer.items) {
    console.log("item.type:", item.type);

    if (VALID_FILES.includes(item.type)) {
      setFileValid({ type: [], valid: true });
    } else {
      setFileValid({ type: [item.type], valid: false });
    }
    setDrag(true);
  }
};

const handleDragLeave = (ev) => {
  ev.preventDefault();
  setDrag(false); // no longer dragging
  setFileValid({ type: [], valid: null }); // return to null state
};

const handleDrop = (ev) => {
  ev.preventDefault();
  ev.stopPropagation();
  setDrag(false);

  console.log("ev.target:", ev.target);

  const files = Array.from(ev.dataTransfer.files);
  // filter for the valid files in the array of files:
  const validFilesArr = files.filter((file) => VALID_FILES.includes(file.type));

  if (validFilesArr && validFilesArr.length > 0) {
    // ! make API call:
    // mutate(validFilesArr);
  }
};
