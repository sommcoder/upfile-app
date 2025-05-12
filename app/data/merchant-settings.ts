// What we save for each merchant from their settings and send to the Browser
export const settings: MerchantSettings = {
  maxFileSize: 750_000, // 732.42 KB
  maxRequestSize: 1_000_000, // 976.56 KB
  maxFileCount: 4,
  multiFileSubmissionEnabled: null,
  forbiddenFileTypes: [".js", ".exe", ".bat", ".sh", ".php", ".html", ".bin"],
  validFileTypes: {
    "application/acad": ".dwg",
    "image/x-dwg": ".dwg",
    "drawing/x-dwf": ".dwf",
    "image/x-dxf": ".dxf",
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
    "application/vnd.oasis.opendocument.text": ".odt",
    "application/vnd.oasis.opendocument.spreadsheet": ".ods",
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
  },

  blockInjected: true,
  injectionLocation: null,
  injectionRootSelector: "#CartDrawer",
  injectionParentSelector: "cart-drawer-items",
  injectionConfig: "beforeend", // 'beforeend' 'afterend' etc...

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
