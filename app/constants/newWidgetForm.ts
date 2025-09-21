export const typeOptions = [
  { label: "block", value: "block" },
  { label: "injection", value: "injection" },
];

export const imageFileChoices = [
  {
    label: ".webp",
    value: "webp",
    helpText: "Efficient image format for fast load times.",
  },
  {
    label: ".png",
    value: "png",
    helpText: "Best for transparent or sharp-edged images.",
  },
  {
    label: ".jpg",
    value: "jpg",
    helpText: "Common for photography and high-quality visuals.",
  },
  {
    label: ".gif",
    value: "gif",
    helpText: "Used for animations or simple image loops.",
  },
  {
    label: ".svg",
    value: "svg",
    helpText: "Best for scalable vector graphics like icons or logos.",
  },
  {
    label: ".bmp",
    value: "bmp",
    helpText: "Uncompressed image format, not commonly used online.",
  },
  {
    label: ".tiff",
    value: "tiff",
    helpText: "High-resolution format used in professional publishing.",
  },
];

export const docFileChoices = [
  {
    label: ".pdf",
    value: "pdf",
    helpText: "Best for sharing documents that shouldn't change.",
  },
  {
    label: ".csv",
    value: "csv",
    helpText: "Comma separated values for data handling",
  },
  {
    label: ".docx",
    value: "docx",
    helpText: "Standard Microsoft Word document.",
  },
  {
    label: ".xlsx",
    value: "xlsx",
    helpText: "Spreadsheet used with Microsoft Excel.",
  },
  {
    label: ".pptx",
    value: "pptx",
    helpText: "Presentation file used with Microsoft PowerPoint.",
  },
  {
    label: ".odt",
    value: "odt",
    helpText: "OpenDocument text format for word processing.",
  },
  {
    label: ".ods",
    value: "ods",
    helpText: "OpenDocument spreadsheet format.",
  },
  {
    label: ".txt",
    value: "txt",
    helpText: "Plain text file, ideal for simple notes or logs.",
  },
];

export const modelFileChoices = [
  { label: ".stl", value: "stl", helpText: "Common format for 3D printing." },
  {
    label: ".step",
    value: "step",
    helpText: "Used for CAD models in engineering.",
  },
  {
    label: ".stp",
    value: "stp",
    helpText: "Alternate extension for STEP format.",
  },
  {
    label: ".obj",
    value: "obj",
    helpText: "3D object format for models and meshes.",
  },
  {
    label: ".glb",
    value: "glb",
    helpText: "Binary format for 3D scenes and models.",
  },
  {
    label: ".gltf",
    value: "gltf",
    helpText: "Efficient JSON-based 3D model format.",
  },
  {
    label: ".dae",
    value: "dae",
    helpText: "Collada format for exchanging 3D assets.",
  },
  { label: ".dwg", value: "dwg", helpText: "AutoCAD drawing format." },
  { label: ".dxf", value: "dxf", helpText: "Drawing exchange format for CAD." },
  { label: ".dwf", value: "dwf", helpText: "Used for viewing CAD data." },
  {
    label: ".iges",
    value: "iges",
    helpText: "Neutral CAD file for data exchange.",
  },
  { label: ".igs", value: "igs", helpText: "Alternate extension for IGES." },
  {
    label: ".3mf",
    value: "3mf",
    helpText: "3D Manufacturing Format for printing.",
  },
  {
    label: ".sla",
    value: "sla",
    helpText: "Stereolithography format for 3D printing.",
  },
  { label: ".amf", value: "amf", helpText: "Additive manufacturing format." },
  {
    label: ".gcode",
    value: "gcode",
    helpText: "Machine instructions for 3D printers.",
  },
];

export const compressionFileChoices = [
  {
    label: ".zip",
    value: "zip",
    helpText: "Compressed archive format used widely for packaging files.",
  },
  {
    label: ".rar",
    value: "rar",
    helpText: "Proprietary compressed archive format.",
  },
  {
    label: ".7z",
    value: "7z",
    helpText: "High-compression archive format by 7-Zip.",
  },
  {
    label: ".tar",
    value: "tar",
    helpText: "Unix-based archive format (often used with gzip).",
  },
  {
    label: ".gz",
    value: "gz",
    helpText: "Gzip-compressed file, often paired with .tar.",
  },
];

export const audioVideoFileChoices = [
  {
    label: ".mp3",
    value: "mp3",
    helpText: "Popular audio format with lossy compression.",
  },
  {
    label: ".wav",
    value: "wav",
    helpText: "Uncompressed audio format with high quality.",
  },
  {
    label: ".ogg",
    value: "ogg",
    helpText: "Open audio format with better compression than MP3.",
  },
  {
    label: ".mp4",
    value: "mp4",
    helpText: "Widely used video format for streaming and playback.",
  },
  {
    label: ".mov",
    value: "mov",
    helpText: "Apple's video format with high quality.",
  },
  {
    label: ".webm",
    value: "webm",
    helpText: "Efficient video format for web use.",
  },
  {
    label: ".avi",
    value: "avi",
    helpText: "Older video format with broad compatibility.",
  },
];

export const webFileChoices = [
  {
    label: ".html",
    value: "html",
    helpText: "Hypertext Markup Language file used to structure web pages.",
  },
  {
    label: ".css",
    value: "css",
    helpText: "Cascading Style Sheets file for styling web content.",
  },
  {
    label: ".json",
    value: "json",
    helpText: "JavaScript Object Notation, used for storing structured data.",
  },
  {
    label: ".xml",
    value: "xml",
    helpText: "Extensible Markup Language file used for data transport.",
  },
  {
    label: ".svg",
    value: "svg",
    helpText: "Scalable Vector Graphics - XML-based vector image format.",
  },
];

export const fontFileChoices = [
  {
    label: ".ttf",
    value: "ttf",
    helpText: "TrueType font format, widely supported.",
  },
  {
    label: ".otf",
    value: "otf",
    helpText: "OpenType font format, flexible and modern.",
  },
  {
    label: ".woff",
    value: "woff",
    helpText: "Web Open Font Format, optimized for web use.",
  },
  {
    label: ".woff2",
    value: "woff2",
    helpText: "Compressed version of WOFF, preferred for modern web.",
  },
];

export const statusOptions = [
  { label: "draft", value: "draft" },
  { label: "active", value: "active" },
];

/*
permittedFileTypes: {
   ! 3D Models & CAD Files
    "application/acad": { extensions: [".dwg"], risk: "medium" },
    "image/x-dwg": { extensions: [".dwg"], risk: "medium" },
    "drawing/x-dwf": { extensions: [".dwf"], risk: "medium" },
    "application/dxf": { extensions: [".dxf"], risk: "medium" },
    "image/x-dxf": { extensions: [".dxf"], risk: "medium" },
    "model/iges": { extensions: [".iges", ".igs"], risk: "medium" },
    "model/step": { extensions: [".step", ".stp"], risk: "medium" },
    "model/stl": { extensions: [".stl"], risk: "low" },
    "model/3mf": { extensions: [".3mf"], risk: "low" },
    "application/sla": { extensions: [".sla"], risk: "medium" },
    "application/x-amf": { extensions: [".amf"], risk: "medium" },
    "application/x-gcode": { extensions: [".gcode"], risk: "medium" },
    "model/gltf+json": { extensions: [".gltf"], risk: "low" },
    "model/gltf-binary": { extensions: [".glb"], risk: "low" },
    "model/obj": { extensions: [".obj"], risk: "low" },
    "model/vnd.collada+xml": { extensions: [".dae"], risk: "low" },

   ! Images & Graphics
    "image/jpeg": { extensions: [".jpg", ".jpeg"], risk: "low" },
    "image/png": { extensions: [".png"], risk: "low" },
    "image/gif": { extensions: [".gif"], risk: "low" },
    "image/svg+xml": { extensions: [".svg"], risk: "high" },
    "image/webp": { extensions: [".webp"], risk: "low" },
    "image/bmp": { extensions: [".bmp"], risk: "low" },
    "image/tiff": { extensions: [".tiff"], risk: "low" },

    ! Documents & Spreadsheets
    "application/pdf": { extensions: [".pdf"], risk: "medium" },
    "application/vnd.oasis.opendocument.text": {
      extensions: [".odt"],
      risk: "medium",
    },
    "application/vnd.oasis.opendocument.spreadsheet": {
      extensions: [".ods"],
      risk: "medium",
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      extensions: [".docx"],
      risk: "high",
    },
    "application/vnd.ms-excel": { extensions: [".xls"], risk: "high" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      extensions: [".xlsx"],
      risk: "high",
    },
    "application/vnd.ms-powerpoint": { extensions: [".ppt"], risk: "high" },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      {
        extensions: [".pptx"],
        risk: "high",
      },

    ! Web & Code Files
    "text/plain": { extensions: [".txt"], risk: "low" },
    "text/css": { extensions: [".css"], risk: "medium" },
    "application/json": { extensions: [".json"], risk: "medium" },
    "application/xml": { extensions: [".xml"], risk: "medium" },

    ! Archives & Compressed Files
    "application/zip": { extensions: [".zip"], risk: "high" },
    "application/x-tar": { extensions: [".tar"], risk: "high" },
    "application/gzip": { extensions: [".gz"], risk: "high" },
    "application/x-7z-compressed": { extensions: [".7z"], risk: "high" },
    "application/x-rar-compressed": { extensions: [".rar"], risk: "high" },

    ! Audio & Video
    "audio/mpeg": { extensions: [".mp3"], risk: "low" },
    "audio/ogg": { extensions: [".ogg"], risk: "low" },
    "video/mp4": { extensions: [".mp4"], risk: "low" },
    "video/x-msvideo": { extensions: [".avi"], risk: "low" },
    "video/webm": { extensions: [".webm"], risk: "low" },

    ! Fonts & Typography
    "application/x-font-ttf": { extensions: [".ttf"], risk: "low" },
    "application/x-font-otf": { extensions: [".otf"], risk: "low" },
    "application/vnd.ms-fontobject": { extensions: [".eot"], risk: "low" },
    "application/x-font-woff": { extensions: [".woff"], risk: "low" },
    "application/x-font-woff2": { extensions: [".woff2"], risk: "low" },

  },

    forbiddenFileTypes: [".js", ".exe", ".bat", ".sh", ".php", ".html", ".bin"],
  // might be best to serialize this a json if you want to store as metaobject on Shopify. Why? You'll need the whole thing anyways, right?

  // ! possible file types:


   
  widgetName: string;
    widgetType: "block" | "injection";
    maxFileSize: number; 
    !should this be based on plan?


    permittedFileTypes: Record<string, string> | null;
    multiFileSubmissionEnabled: boolean | null;
    maxFileCount: number | null;
    shadowRootEnabled: boolean;
    blockSettings?: BlockSettings;
    injectionSettings?: InjectionSettings;
    customHtml: {
      customHTML: string;
    };
    customJs: {
      customJS: string;
    };
    customCss: {
      customCSS: string;
    };
    productIdList: Record<string, string> | [];
    collectionIdList: Record<string, string> | [];
    themeActivationType: "main-only" | "all-themes" | "custom-list";
    validThemeList: string[] | [];
   
  */
