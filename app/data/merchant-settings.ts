// What we save for each merchant from their settings and send to the Browser
export const settings: ShopSettings = {
  "max-file-size": 750_000, // 732.42 KB
  maxRequestSize: 1_000_000, // 976.56 KB
  maxFileCount: 4,
  multiFileSubmissionEnabled: null,
  forbiddenFileTypes: [".js", ".exe", ".bat", ".sh", ".php", ".html", ".bin"],
  // might be best to serialize this a json if you want to store as metaobject on Shopify. Why? You'll need the whole thing anyways, right?

  // ! possible file types:
  permittedFileTypes: {
    // 3D Models & CAD Files
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

    // Images & Graphics
    "image/jpeg": { extensions: [".jpg", ".jpeg"], risk: "low" },
    "image/png": { extensions: [".png"], risk: "low" },
    "image/gif": { extensions: [".gif"], risk: "low" },
    "image/svg+xml": { extensions: [".svg"], risk: "high" },
    "image/webp": { extensions: [".webp"], risk: "low" },
    "image/bmp": { extensions: [".bmp"], risk: "low" },
    "image/tiff": { extensions: [".tiff"], risk: "low" },

    // Documents & Spreadsheets
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

    // Web & Code Files
    "text/plain": { extensions: [".txt"], risk: "low" },
    "text/css": { extensions: [".css"], risk: "medium" },
    "application/json": { extensions: [".json"], risk: "medium" },
    "application/xml": { extensions: [".xml"], risk: "medium" },

    // Archives & Compressed Files
    "application/zip": { extensions: [".zip"], risk: "high" },
    "application/x-tar": { extensions: [".tar"], risk: "high" },
    "application/gzip": { extensions: [".gz"], risk: "high" },
    "application/x-7z-compressed": { extensions: [".7z"], risk: "high" },
    "application/x-rar-compressed": { extensions: [".rar"], risk: "high" },

    // Audio & Video
    "audio/mpeg": { extensions: [".mp3"], risk: "low" },
    "audio/ogg": { extensions: [".ogg"], risk: "low" },
    "video/mp4": { extensions: [".mp4"], risk: "low" },
    "video/x-msvideo": { extensions: [".avi"], risk: "low" },
    "video/webm": { extensions: [".webm"], risk: "low" },

    // Fonts & Typography
    "application/x-font-ttf": { extensions: [".ttf"], risk: "low" },
    "application/x-font-otf": { extensions: [".otf"], risk: "low" },
    "application/vnd.ms-fontobject": { extensions: [".eot"], risk: "low" },
    "application/x-font-woff": { extensions: [".woff"], risk: "low" },
    "application/x-font-woff2": { extensions: [".woff2"], risk: "low" },

    // Mac System Files & Misc
    "application/x-apple-diskimage": { extensions: [".dmg"], risk: "high" },
    "application/mac-binhex40": { extensions: [".hqx"], risk: "medium" },
    "application/x-apple-property-list": {
      extensions: [".plist"],
      risk: "medium",
    },
  },

  appBlockExtensionsEnabled: true,
  injectionPosition: "beforeend", // 'beforeend' 'afterend' etc...
  embedInjectionLocation: "#CartDrawer",
  injectionParentSelector: "cart-drawer-items",

  customHTML: `
<div id="upfile__wrapper">
  <div id="upfile__block">
    <form id="upfile__dropzone">
      <div class="upfile__spinner" data-id=""></div>
      <input
        type="file"
        id="upfile__dropzone_manual_file_input"
        multiple
        style="display: none"
      />
      <span id="upfile__dropzone_help_text"></span>
      <span id="upfile__dropzone_middle_wrapper">
        <span id="upfile__dropzone_text"></span>
        <button id="upfile__dropzone_select_file_btn">Upload</button>
      </span>
      <span id="upfile__dropzone_file_size_tally_container">
        <span id="upfile__dropzone_file_size_tally">0.00</span>
        <span>of</span>
        <span id="upfile__dropzone_file_size_max">0.00</span>
      </span>
    </form>

    <span id="upfile__fileviewer">
      <div id="upfile__fileviewer_item_list">
        <div class="upfile__fileviewer_item_row">
          <span class="upfile__fileviewer_left_section">
            <span class="upfile__fileviewer_file_thumbnail_wrapper">
              <img
                class="upfile__fileviewer_file_thumbnail_image"
                width="100%"
                height="100%"
                alt=""
              />
            </span>
          </span>
          <span class="upfile__fileviewer_center_section">
            <span class="upfile__fileviewer_item_name" data-name=""></span>
            <span class="upfile__fileviewer_item_size" data-size=""></span>
            <div class="upfile__fileviewer_item_status" data-status=""></div>
          </span>
          <span class="upfile__fileviewer_right_section">
            <img
              class="upfile__fileviewer_trash_icon"
              data-id=""
              data-trash=""
              src="/assets/trash-icon.svg"
              height="15px"
              width="15px"
            />
          </span>
        </div>
        <div class="upfile__spinner" data-id=""></div>
        <div id="upfile__fileviewer_placeholder">No files uploaded yet.</div>
      </div>
      <div id="upfile__fileviewer_error_list">
        <div class="upfile__fileviewer_error_item">
          <img
            src="/assets/file-error-icon.svg"
            height="15px"
            width="15px"
          />
          <span class="upfile__fileviewer_error_text"></span>
        </div>
      </div>
    </span>
  </div>
</div>`, // HTML is Upfile to be injected via 3rd party of app embed
  customJS: `console.log('testing the customJS);`, // for added functionality
  customCSS: `
    span {
      background-color: purple;
    }
  `, // CSS will be injected and take precedence over other styles
};
