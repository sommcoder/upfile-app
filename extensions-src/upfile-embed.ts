"use strict";

/*
Might be able to offload a lot of the block.js stuff here such as:
- settings loading for the merchant
- FYI through the deep link we're able to get the UUID for the app embed

- We can make an async call to our server to load the settings and we can put them on the window object.. ?

Apparently we can use event listeners and window props/methods to communicate with the theme block
*/

// TODO: need to add the rest of the constructor
class Upfile implements UpfileSettings {
  VALID_FILE_TYPES_OBJ: Record<string, string>;
  MAX_FILE_SIZE: number | null;
  MAX_FILE_COUNT: number | null;
  MAX_REQUEST_SIZE: number | null;
  SHOPIFY_APP_PROXY_URL: string;
  dropzoneFileSizeMax?: HTMLElement;
  dropzoneBlock: BlockDataElement | null;
  fileTypeMap: Record<string, string>;

  constructor() {
    this.dropzoneBlock = document.querySelector("#upfile__dropzone");
    // set up shadowDOM and move the block into it
    if (this.dropzoneBlock) {
      const shadowRoot = this.dropzoneBlock.attachShadow({ mode: "open" });
      shadowRoot.appendChild(this.dropzoneBlock);

      // TODO: will need to get the merchant's CSS settings at some point!
      // const link = document.createElement("link");
      // link.rel = "stylesheet";
      // link.href = "/path-to/your/dropzone.css"; // Use the correct path for your Shopify store
      // shadowRoot.appendChild(link);
      console.log("this.dropzoneBlock:", this.dropzoneBlock);
      this.SHOPIFY_APP_PROXY_URL = this.dropzoneBlock.dataset.proxyUrl;

      if (this.SHOPIFY_APP_PROXY_URL) {
        this.getSettings(this.SHOPIFY_APP_PROXY_URL);
      }
    } else {
      console.log("ERROR: no app proxy URL on block element");
    }
  }

  // ! we should STILL be within shopify's block div wrapper and therefore should be fine!

  async getSettings(url: string) {
    try {
      const res = await fetch(`${url}/merchant`);
      if (!res.ok) {
        throw new Error("Failed to fetch merchant settings");
      }

      const settings: MerchantSettings = await res.json();
      console.log("settings:", settings);
    } catch (err) {
      console.error("Could not get merchant settings:", err);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.upfile = new UpfileSettings();
  console.log("window.upfile:", window.upfile);
});
