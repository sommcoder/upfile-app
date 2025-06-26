import { UpfileBlock } from "./upfile-block";
/*
- FYI through the deep link we're able to get the UUID for the app embed.. do I just need this for deep linking???

- Shopify automatically gives us the x-shopify-shop-domain through app proxy calls.

Best practice: assign your own UUID to each merchant and use that for referencing their data consistently across client/server.

TODO: 
1) should probably figure out a way to work with cart apps via API/script injection and also just regular /cart page or drawer

! for theme carts, can we use app bridge to inject

2) How can I ensure compatibility with social media in-app browsers?
-> use Browser stack or manual testing on a live store.

Be Cautious With File Uploads and Downloads

Features like file upload may be restricted or buggy in in-app browsers:
    - Always test file inputs and downloads in these browsers
    - Provide fallback or friendly error messages if needed

const ua = navigator.userAgent || navigator.vendor || window.opera;
const isInAppBrowser = /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|TikTok/i.test(ua);

"For the best experience, please open this page in your default browser."

TODO: need to account for in-app browser viewing too!
! Maybe when on a in-app browser when the users clicks the select button it can redirect the user to the current URL in their default browser



1) if Liquid Theme Block on page we SHOULDN'T build our Theme Block Class below!

2) if page changes we should do a check/update on the UpfileAppBridge, clear the session items, EXCEPT for session settings?
*/

/* 
- we want to generate the UpfileWidget based on merchant settings but also
ONLY on the page that the merchant is on.
- theme blocks are easy


- get the blockId from the DOM
*/
//

function initUpfile() {
  console.log("UPFILE initUpfile() called");
  if (self.Shopify) {
    new UpfileAppBridge();
    console.log("App Bridge created and mounted");
    self.dispatchEvent(new CustomEvent("upfile:loaded"));
  } else {
    console.warn("Upfile could not get self.Shopify");
  }
}

self.addEventListener("DOMContentLoaded", initUpfile);
self.addEventListener("shopify:section:load", initUpfile);

class UpfileAppBridge {
  // static app data:
  #SHOPIFY_APP_PROXY_URL: string;
  #PROXY_ROUTE: string = "apps/dropzone";
  #ACCESS_TOKEN: string | null = null;

  // should be loaded from metadata?
  settings: MerchantSettings = {
    maxFileSize: null,
    maxRequestSize: null,
    subscriptionPlan: null,
    forbiddenFileTypes: [".js", ".exe", ".bat", ".sh", ".php", ".html", ".bin"],
    themeBlockEnabled: null,
    upfileWidgets: [],
  };

  // 'Session' State:
  // will eventually just be stored in the browser
  #cartId: string | null = null; // important => <token>?key=<secret>
  hiddenInput: HTMLInputElement | null = null;
  errorMessages: string[] = [];
  fileNameSet: Set<string> = new Set();
  fileViewerUIMap: Map<string, HTMLElement> = new Map();
  fileStateObj: Record<string, FileState> = {};
  totalStateFileSize: number = 0;
  formData: FormData = new FormData();
  cart: {} | null = null; // what our storefront API will reference

  constructor() {
    self.upfile = this;
    // @ts-ignore
    this.#SHOPIFY_APP_PROXY_URL = `${self.Shopify.shop}/${this.#PROXY_ROUTE}`;
    this.getMerchantSettings();
    this.getCart();
    // TODO: how do we determine WHICH widget this is?

    // Page dependent?
    // Merchant sets the injection location for a set number of possible locations:
    // Injections should occur at the Collection or Product level
    // App Bridge handles the injection of the block below.

    // * inject into cart page or PDP
    if (self.upfile.settings.themeBlockEnabled === false) {
      // TODO: we should now dispatch a UI skeleton IF cart == true
      // initialize event listener to wait for:
      // - ATC click
      // - Cart button press
    } else if (
      !self.location.pathname.includes("/products/") &&
      !self.location.pathname.includes("/cart")
    ) {
      console.error(
        "Upfile: current path is NOT on a /products or /cart route",
      );
      //   // fail silently, nothing should load!
      return;
    } else {
      // ! means we are on a cart or products page and the theme app block NEEDS to be on the page now!
      if (self.location.pathname.includes("/products/")) {
        // this.productForm =
        //   document.querySelector('[data-type="add-to-cart-form"]') ||
        //   document.querySelector('form[action*="/cart/add"]') ||
        //   document.querySelector('form[action^="/cart"]') ||
        //   null;
        // if (!this.productForm) {
        //   console.warn(
        //     "No product form found. Some theme customization might be required.",
        //   );
        //   throw new Error("UPFILE ERROR: Origin does not contain 'myshopify'");
        // }
      }

      this.initializeAppBridgeEvents();
      self.dispatchEvent(new CustomEvent("upfile:loaded"));
    }
  }

  injectShadowRoot() {
    //
  }

  injectStylesheet() {
    //
  }

  // AJAX Cart handling:
  // This is what get's added from the theme basically.
  // converting cart data to data that can be handled by the storefront Cart API calls
  async getCart() {
    const result = await fetch(`${self.Shopify.routes.root}cart.js`).then(
      (res) => res.json(),
    );
    this.cart = result || {};
  }

  async getMerchantSettings() {
    try {
      const res = await fetch(`${this.#SHOPIFY_APP_PROXY_URL}/merchant`);
      if (!res.ok) {
        throw new Error("Failed to fetch merchant settings");
      }
      const data: MerchantData = await res.json();
      console.log("data:", data);
      self.upfile.settings = { ...data.settings };
      self.upfile.#ACCESS_TOKEN = data.upfilePublicStorefrontAccessToken;
      console.log("self.upfile.#ACCESS_TOKEN:", self.upfile.#ACCESS_TOKEN);
    } catch (err) {
      console.error("Could not get merchant settings:", err);
      return null;
    }
  }

  async addToCart(items: CartItem[]) {
    try {
      const response = await fetch(`${self.Shopify.routes.root}cart/add.js`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.status}`);
      }

      const data = await response.json();
      console.log("Add to cart response:", data);
      return data;
    } catch (error) {
      console.error("addToCart() error:", error);
      return null;
    }
  }

  async updateCart(cartId: string, lineId: string, quantity: number) {
    try {
      const response = await fetch(
        `${this.#SHOPIFY_APP_PROXY_URL}/cart/update.js`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operation: "updateCart",
            input: {
              cartId,
              lines: [
                {
                  id: lineId,
                  quantity,
                },
              ],
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update cart: ${response.status}`);
      }

      const data = await response.json();
      console.log("Update cart response:", data);
      return data;
    } catch (error) {
      console.error("updateCart() error:", error);
      return null;
    }
  }

  async postFiles(formData: FormData): Promise<PostFileResponse> {
    try {
      const response = await fetch(`${this.#SHOPIFY_APP_PROXY_URL}/file`, {
        method: "POST",
        redirect: "manual",
        body: formData,
        headers: {
          "Content-Length": self.upfile.totalStateFileSize.toString(),
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`Upload failed (${response.status}): ${message}`);
      }

      return await response.json();
    } catch (error) {
      console.error("postFiles():", error);
      return { data: null, error: (error as Error).message };
    }
  }

  async deleteFiles(files: string[]): Promise<DeleteFilesResult> {
    try {
      const response = await fetch(`${this.#SHOPIFY_APP_PROXY_URL}/file`, {
        method: "DELETE",
        redirect: "manual",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(files),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`Delete failed (${response.status}): ${message}`);
      }

      const failed: DeleteFileResponse[] = await response.json();

      if (failed.length > 0) {
        console.warn("Some files failed to delete:", failed);
      }

      return { failed };
    } catch (error) {
      console.error("deleteFiles():", error);
      return {
        failed: [],
        error: (error as Error).message,
      };
    }
  }

  // *state
  addFileState(fileId: string, file: File) {
    self.upfile.fileStateObj[fileId] = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: null,
    };
    self.upfile.fileNameSet.add(file.name);
    self.upfile.totalStateFileSize += file.size;
  }

  updateFileStatus(id: string, status: FileStatus): boolean {
    if (!Object.hasOwn(self.upfile.fileStateObj, id)) {
      console.error(`File with id: ${id} does not exist in state`);
      return false;
    }
    const itemStatus =
      status === "fulfilled" || status === "success" ? "success" : "failed";
    self.upfile.fileStateObj[id].status = itemStatus;

    const statusEl = self.upfile.fileViewerUIMap
      .get(id)
      ?.querySelector<HTMLElement>("[data-status]");
    if (statusEl) {
      statusEl.textContent = itemStatus;
      statusEl.dataset.status = itemStatus;
    }

    return true;
  }

  deleteFileState(id: string) {
    const file = self.upfile.fileStateObj[id];
    self.upfile.totalStateFileSize -= file.size;
    self.upfile.fileNameSet.delete(file.name);
    delete self.upfile.fileStateObj[id];
    self.upfile.fileViewerUIMap.delete(id);
  }

  deleteVariantProps(fileId: string) {
    if (this.hiddenInput) {
      const updatedValue = this.hiddenInput.value
        .split(",")
        .filter((id: string) => id !== fileId)
        .join(",");
      this.hiddenInput.value = updatedValue;
    }
  }

  validateSubmittedFile(file: File): boolean {
    self.upfile.errorMessages = [];

    if (
      !Object.hasOwn(self.upfile.settings.permittedFileTypes || {}, file.type)
    ) {
      this.errorMessages.push(
        `'${file.name}' is an invalid file type: (${file.type})`,
      );
    }

    if (
      self.upfile.settings.maxFileSize !== null &&
      self.upfile.settings.maxRequestSize
    ) {
      if (file.size > self.upfile.settings.maxFileSize) {
        this.errorMessages.push(
          `'${file.name}' exceeds the max size by: ${this.formatToByteStr(file.size - self.upfile.settings.maxFileSize)}`,
        );
      }
      if (this.fileNameSet.has(file.name)) {
        this.errorMessages.push(`'${file.name}' is a DUPLICATE file name`);
      }
      if (
        this.totalStateFileSize + file.size >
        self.upfile.settings.maxRequestSize
      ) {
        self.upfile.errorMessages.push(
          `'${file.name}' exceeds combined permitted size`,
        );
      }
    }

    return self.upfile.errorMessages.length === 0;
  }

  validateDraggedFile(file: DataTransferItem): boolean {
    if (self.upfile.settings.permittedFileTypes) {
      return Object.hasOwn(self.upfile.settings.permittedFileTypes, file.type);
    }
    return false;
  }

  formatToByteStr(byteSize: number): string {
    let size = byteSize;
    const units = ["B", "KB", "MB", "GB"];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  initializeAppBridgeEvents() {
    document.addEventListener("cart:updated", (ev) => {
      console.log("ev:", ev);
      // const cart = ev.detail.cart;
    });
  }
}

/*
TODO:
1) error messages don't hide
2) error messages don't have correct spacing
3) need to render SOMETHING above the select files Button
4) Need to make the error messages more user friendly. keep the explicit ones for a console.error() however the user just needs to know 'invalid file type' etc.
5) csv/excel file seemed to NOT work
6) the fileviewer list is rendering weird and no loading is displaying as well as no file type text over the file icon.
 
*/

// TODO: create warning when we can't get self.upfile => ie. the embed block is not on

// Data moves DOWNSTREAM to the UI layer.
// Requests are called UPSTREAM via self.upfile

// class UpfileImageCropper {
//   constructor() {}
// }

self.addEventListener("upfile:loaded", () => {
  new UpfileBlock();
  // if image editor is enabled, initialize it
  // if they are TWO different app embeds, they have to communicate over the window right?
  // if (self.upfile.settings.imageCropperEnabled) {
  //   new UpfileImageCropper();
  // }
});
