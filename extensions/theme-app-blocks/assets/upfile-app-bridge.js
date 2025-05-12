"use strict";
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

    Always test file inputs and downloads in these browsers

    Provide fallback or friendly error messages if needed

const ua = navigator.userAgent || navigator.vendor || window.opera;
const isInAppBrowser = /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|TikTok/i.test(ua);

"For the best experience, please open this page in your default browser."

TODO: need to account for in-app browser viewing too!
! Maybe when on a in-app browser when the users clicks the select button it can redirect the user to the current URL in their default browser



1) if Liquid Theme Block on page we SHOULDN'T build our Theme Block Class below!

2) if page changes we should do a check/update on the UpfileAppBridge, clear the session items, EXCEPT for session settings?
*/
function initUpfile() {
    console.log("upfile initUpfile() called");
    new UpfileAppBridge();
    console.log("Upfile created and mounted");
    console.log("self.upfile:", self.upfile);
    // should in fact be a custom event listener to wait for the self.upfile to be mounted?
    self.dispatchEvent(new CustomEvent("upfile:loaded"));
}
self.addEventListener("DOMContentLoaded", initUpfile);
self.addEventListener("shopify:section:load", initUpfile);
console.log("1000");
// This class is 100% needed for functionality
// I want it to function with the liquid app block if the user is using a theme cart AS WELL AS if the user is using a 3rd party injected cart
class UpfileAppBridge {
    // static app data:
    #SHOPIFY_APP_PROXY_URL;
    #PROXY_ROUTE = "apps/dropzone";
    #ACCESS_TOKEN = null;
    settings = {
        maxFileSize: null,
        maxFileCount: null,
        maxRequestSize: null,
        validFileTypes: null,
        multiFileSubmissionEnabled: null,
        forbiddenFileTypes: [".js", ".exe", ".bat", ".sh", ".php", ".html", ".bin"],
        blockInjected: false,
        injectionLocation: null,
        injectionRootSelector: "",
        injectionParentSelector: "",
        injectionConfig: null,
        customHTML: "",
        customCSS: "",
        customJS: "",
    };
    // Session State:
    store = self.location.origin;
    hiddenInput = null;
    errorMessages = [];
    fileNameSet = new Set();
    fileViewerUIMap = new Map();
    fileStateObj = {};
    totalStateFileSize = 0;
    formData = new FormData();
    cart = null;
    cartId = null;
    constructor() {
        self.upfile = this;
        if (this.store.includes("myshopify.com")) {
            console.log("this.store:", this.store);
            this.#SHOPIFY_APP_PROXY_URL = `${this.store}/${this.#PROXY_ROUTE}`;
            console.log("this.#SHOPIFY_APP_PROXY_URL:", this.#SHOPIFY_APP_PROXY_URL);
        }
        else {
            console.error("%c⚠️ UPFILE ERROR: Origin does not contain 'myshopify'!", "background: red; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;");
            throw new Error("UPFILE ERROR: Origin does not contain 'myshopify'");
        }
        this.getMerchantSettings();
        this.getCart();
        // * inject into cart page or PDP
        if (self.upfile.settings.blockInjected === false) {
            // we should now dispatch a UI skeleton IF cart == true
            // initialize event listener to wait for:
            // - ATC click
            // - Cart button press
            // } else if (
            //   !self.location.pathname.includes("/products/") &&
            //   !self.location.pathname.includes("/cart")
            // ) {
            //   console.log("Upfile: current path is NOT on a /products or /cart route");
            //   // fail silently, nothing should load!
            //   return;
            // } else {
            //   // ! means we are on a cart of products page and the theme app block NEEDS to be on the page now!
            //   if (self.location.pathname.includes("/products/")) {
            //     this.productForm =
            //       document.querySelector('[data-type="add-to-cart-form"]') ||
            //       document.querySelector('form[action*="/cart/add"]') ||
            //       document.querySelector('form[action^="/cart"]') ||
            //       null;
            //     if (!this.productForm) {
            //       console.warn(
            //         "No product form found. Some theme customization might be required.",
            //       );
            //       throw new Error("UPFILE ERROR: Origin does not contain 'myshopify'");
            //     }
            //   }
            //   // cart page doesn't need to worry about a product form! If not, throw error!
            //   // TODO: just do a check to see if we can get the elements:
            //   this.dropzoneBlock = document.getElementById("#upfile__dropzone");
            //   this.fileViewerBlock = document.getElementById("#upfile__fileviewer");
        }
        else {
            // * inject into cart-drawer
        }
        this.initializeAppBridgeEvents();
        self.dispatchEvent(new CustomEvent("upfile:loaded"));
    }
    // ! we need to ADD the UI in the bridge otherwise there won't be anything to query in the AppBlock!
    injectShadowRoot() {
        //
    }
    injectStylesheet() {
        //
    }
    async getCart() {
        try {
            const res = await fetch(`${this.store}/cart.js`);
            console.log("res:", res);
            if (!res.ok) {
                throw new Error("Failed to fetch cart");
            }
            const data = await res.json();
            console.log("data:", data);
            self.upfile.cart = data.cart;
        }
        catch (error) {
            console.error("getCart() Error getting cart via storefront GQL API:", error);
            return null;
        }
    }
    /*
  
    TODO: implement these calls
  Get cart
  const cart = await window.upfile.getCart();
  
  Add to cart
  await window.upfile.addToCart(cartId, variantId, quantity);
  
  Update cart
  await window.upfile.updateCart(cartId, lineId, newQuantity);
  
  */
    async updateCartMetaField() {
        try {
            await fetch(`${this.store}/file`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: lineItemKey, // You get this from /cart.js response
                    quantity: currentQuantity, // Must be included! Shopify may think you're removing
                    properties: {
                        __upfile_id: yourFileId,
                    },
                }),
            });
        }
        catch (error) {
            if (error instanceof Error) {
                console.log("updateCart msg:", error.message);
            }
            else {
                console.log("updateCart error:", error);
            }
        }
    }
    // in cart, directly on a cart item
    // async updateCartLineItem() {
    //   try {
    //     await fetch(`${url}/file`, {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         id: lineItemKey, // You get this from /cart.js response
    //         quantity: currentQuantity, // Must be included! Shopify may think you're removing
    //         properties: {
    //           __upfile_id: yourFileId,
    //         },
    //       }),
    //     });
    //   } catch (error) {
    //     if (error instanceof Error) {
    //       console.log("updateCart msg:", error.message);
    //     } else {
    //       console.log("updateCart error:", error);
    //     }
    //   }
    // }
    async getMerchantSettings() {
        try {
            const res = await fetch(`${this.#SHOPIFY_APP_PROXY_URL}/merchant`);
            if (!res.ok) {
                throw new Error("Failed to fetch merchant settings");
            }
            const data = await res.json();
            console.log("data:", data);
            self.upfile.settings = { ...data.settings };
            self.upfile.#ACCESS_TOKEN = data.accessToken;
            console.log("self.upfile.#ACCESS_TOKEN:", self.upfile.#ACCESS_TOKEN);
        }
        catch (err) {
            console.error("Could not get merchant settings:", err);
            return null;
        }
    }
    async addToCart(cartId, variantId, quantity = 1) {
        try {
            const response = await fetch(`${this.#SHOPIFY_APP_PROXY_URL}/cart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    operation: "addToCart",
                    input: {
                        cartId,
                        lines: [
                            {
                                merchandiseId: variantId,
                                quantity,
                            },
                        ],
                    },
                }),
            });
            if (!response.ok) {
                throw new Error(`Failed to add to cart: ${response.status}`);
            }
            const data = await response.json();
            console.log("Add to cart response:", data);
            return data;
        }
        catch (error) {
            console.error("addToCart() error:", error);
            return null;
        }
    }
    async updateCart(cartId, lineId, quantity) {
        try {
            const response = await fetch(`${this.#SHOPIFY_APP_PROXY_URL}/cart`, {
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
            });
            if (!response.ok) {
                throw new Error(`Failed to update cart: ${response.status}`);
            }
            const data = await response.json();
            console.log("Update cart response:", data);
            return data;
        }
        catch (error) {
            console.error("updateCart() error:", error);
            return null;
        }
    }
    async postFiles(formData) {
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
        }
        catch (error) {
            console.error("postFiles():", error);
            return { data: null, error: error.message };
        }
    }
    async deleteFiles(files) {
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
            const failed = await response.json();
            if (failed.length > 0) {
                console.warn("Some files failed to delete:", failed);
            }
            return { failed };
        }
        catch (error) {
            console.error("deleteFiles():", error);
            return {
                failed: [],
                error: error.message,
            };
        }
    }
    // *state
    addFileState(fileId, file) {
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
    updateFileStatus(id, status) {
        if (!Object.hasOwn(self.upfile.fileStateObj, id)) {
            console.error(`File with id: ${id} does not exist in state`);
            return false;
        }
        const itemStatus = status === "fulfilled" || status === "success" ? "success" : "failed";
        self.upfile.fileStateObj[id].status = itemStatus;
        const statusEl = self.upfile.fileViewerUIMap
            .get(id)
            ?.querySelector("[data-status]");
        if (statusEl) {
            statusEl.textContent = itemStatus;
            statusEl.dataset.status = itemStatus;
        }
        return true;
    }
    deleteFileState(id) {
        const file = self.upfile.fileStateObj[id];
        self.upfile.totalStateFileSize -= file.size;
        self.upfile.fileNameSet.delete(file.name);
        delete self.upfile.fileStateObj[id];
        self.upfile.fileViewerUIMap.delete(id);
    }
    deleteVariantProps(fileId) {
        if (this.hiddenInput) {
            const updatedValue = this.hiddenInput.value
                .split(",")
                .filter((id) => id !== fileId)
                .join(",");
            this.hiddenInput.value = updatedValue;
        }
    }
    validateSubmittedFile(file) {
        self.upfile.errorMessages = [];
        if (!Object.hasOwn(self.upfile.settings.validFileTypes || {}, file.type)) {
            this.errorMessages.push(`'${file.name}' is an invalid file type: (${file.type})`);
        }
        if (self.upfile.settings.maxFileSize !== null &&
            self.upfile.settings.maxRequestSize) {
            if (file.size > self.upfile.settings.maxFileSize) {
                this.errorMessages.push(`'${file.name}' exceeds the max size by: ${this.formatToByteStr(file.size - self.upfile.settings.maxFileSize)}`);
            }
            if (this.fileNameSet.has(file.name)) {
                this.errorMessages.push(`'${file.name}' is a DUPLICATE file name`);
            }
            if (this.totalStateFileSize + file.size >
                self.upfile.settings.maxRequestSize) {
                self.upfile.errorMessages.push(`'${file.name}' exceeds combined permitted size`);
            }
        }
        return self.upfile.errorMessages.length === 0;
    }
    validateDraggedFile(file) {
        if (self.upfile.settings.validFileTypes) {
            return Object.hasOwn(self.upfile.settings.validFileTypes, file.type);
        }
        return false;
    }
    formatToByteStr(byteSize) {
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
class UpfileBlock {
    // Root Elements:
    dropzoneBlock = null;
    fileViewerBlock = null;
    hiddenInput = null;
    // Root Elements (Conditional)
    productForm = null;
    cartRoot = null;
    // dropzone elements:
    dropzoneFileInput = null;
    dropzoneHelpText = null;
    dropzoneText = null;
    dropzoneSelectBtn = null;
    dropzoneFileSizeTally = null;
    dropzoneFileSizeMax = null;
    // fileviewer elements:
    fileViewerList = null;
    fileViewerOriginalRow = null;
    fileViewerTrashIcon = null;
    fileViewerStatus = null;
    loadingSpinner = null;
    fileViewerPlaceholder = null;
    fileViewerErrorList = null;
    fileViewerErrorItem = null;
    constructor() {
        console.log("app block constructing...");
        // only need to be concerned about productForm when we AREN'T injecting into a cart-drawer
        /*
         
        1) won't need to add hidden input to product form
        2) we can just directly add the __hidden input to the whole cart
         
    
        TODO: any way we can make this work agnostically to the root and hidden element inside it?
        */
        console.log("self.upfile.settings.injectionRootSelector:", self.upfile.settings.injectionRootSelector);
        if (self.upfile.cart) {
            // get the cart
            this.cartRoot = document.querySelector(self.upfile.settings.injectionRootSelector || '[id*="cart" i]');
        }
        else {
            this.productForm =
                document.querySelector('[data-type="add-to-cart-form"]') ||
                    document.querySelector('form[action*="/cart/add"]') ||
                    document.querySelector('form[action^="/cart"]') ||
                    null;
        }
        // this.insertAppBlock(this.cartRoot || this.productForm);
        this.dropzoneBlock = document.querySelector("#upfile__dropzone");
        this.fileViewerBlock = document.getElementById("upfile__fileviewer");
        if (this.dropzoneBlock && this.fileViewerBlock && this.productForm) {
            // dropzone:
            this.dropzoneFileInput = this.dropzoneBlock.querySelector("#upfile__dropzone_manual_file_input");
            this.dropzoneHelpText = this.dropzoneBlock.querySelector("#upfile__dropzone_help_text");
            this.dropzoneText = this.dropzoneBlock.querySelector("#upfile__dropzone_text");
            console.log("this.dropzoneText:", this.dropzoneText);
            this.dropzoneSelectBtn = this.dropzoneBlock.querySelector("#upfile__dropzone_select_file_btn");
            this.dropzoneFileSizeTally = this.dropzoneBlock.querySelector("#upfile__dropzone_file_size_tally");
            this.dropzoneFileSizeMax = this.dropzoneBlock.querySelector("#upfile__dropzone_file_size_max");
            // fileviewer:
            this.fileViewerList = this.fileViewerBlock.querySelector("#upfile__fileviewer_item_list");
            if (!this.fileViewerList)
                return;
            this.fileViewerOriginalRow = this.fileViewerList.querySelector(".upfile__fileviewer_item_row");
            this.fileViewerTrashIcon = this.fileViewerList?.querySelector(".upfile__fileviewer_trash_icon");
            this.fileViewerStatus = this.fileViewerList.querySelector(".upfile__fileviewer_item_status");
            /* we can clone the spinner to use in dropzone */
            this.loadingSpinner =
                this.fileViewerList.querySelector(".upfile__spinner");
            this.fileViewerPlaceholder = this.fileViewerList.querySelector("#upfile__fileviewer_placeholder");
            this.fileViewerErrorList = this.fileViewerBlock.querySelector("#upfile__fileviewer_error_list");
            this.fileViewerErrorItem = this.fileViewerBlock.querySelector(".upfile__fileviewer_error_item");
            this.initEventListeners();
            if (this.isInAppBrowser()) {
                // change the 'select file' onClick() to open the user's default browser
                // openInDefaultBrowser()
            }
        }
        else {
            const dropzoneNotice = this.dropzoneBlock?.querySelector("#upfile__dropzone_missing_block_notice");
            if (dropzoneNotice instanceof HTMLElement) {
                dropzoneNotice.style.display = "flex";
                if (!this.dropzoneBlock)
                    return;
                const firstChild = this.dropzoneBlock.firstElementChild;
                // Ensure that firstChild is not null and is an HTMLElement
                if (firstChild instanceof HTMLElement) {
                    firstChild.style.display = "none"; // Hide the first child element
                }
            }
            const fileViewerNotice = this.fileViewerBlock?.querySelector("#upfile__dropzone_missing_block_notice");
            if (fileViewerNotice instanceof HTMLElement) {
                fileViewerNotice.style.display = "flex";
                // Ensure that firstElementChild is not null and is an HTMLElement
                const firstChild = this.fileViewerBlock?.firstElementChild;
                if (firstChild instanceof HTMLElement) {
                    firstChild.style.display = "none"; // Remove other content
                }
            }
        }
    }
    insertAppBlock(element) {
        if (!element) {
            return;
        }
        console.log("element:", element);
        element.insertAdjacentHTML(self.upfile.settings.injectionPosition || "beforeend", self.upfile.settings.customHTML || "");
    }
    isInAppBrowser() {
        const ua = navigator.userAgent || navigator.vendor;
        return /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|TikTok/i.test(ua);
    }
    openInDefaultBrowser() {
        const currentUrl = window.location.href;
        const newWindow = window.open(currentUrl, "_blank");
        // If popup blocked or fails, fall back:
        if (!newWindow ||
            newWindow.closed ||
            typeof newWindow.closed === "undefined") {
            alert("Please open this page in your browser for the best experience.");
        }
    }
    // TODO: just UI methods, anything state related would be called from self.upfile
    togglePlaceholderUI() {
        if (!this.fileViewerPlaceholder)
            return;
        if (self.upfile.fileViewerUIMap.size === 0) {
            this.fileViewerPlaceholder.style.display = "flex";
        }
        else if (self.upfile.fileViewerUIMap.size === 1) {
            this.fileViewerPlaceholder.style.display = "none";
        }
    }
    addVariantProps(id) {
        // product form or hidden input in cart
        if (this.productForm) {
            this.hiddenInput = this.productForm.querySelector("input[name='properties[__upfile_id]']");
        }
        /*
        ! CART ENABLED:
        This is trickier because the item is already in the cart — so you can't just add an input and hope Shopify picks it up. You need to update the cart line item via AJAX.
         
        */
        if (!this.hiddenInput) {
            this.hiddenInput = document.createElement("input");
            this.hiddenInput.type = "hidden";
            this.hiddenInput.name = "properties[__upfile_id]";
            this.hiddenInput.value = id;
            this.productForm?.appendChild(this.hiddenInput);
        }
        else {
            this.hiddenInput.value += `,${id}`;
        }
    }
    renderFileViewerItem(fileObj) {
        let newRowEl = this.fileViewerOriginalRow?.cloneNode(true);
        console.log("START newRowEl:", newRowEl);
        if (!newRowEl || newRowEl === null) {
            return;
        }
        // update data:
        newRowEl.dataset.id = fileObj.id;
        // Safely set dataset and textContent
        const nameEl = newRowEl.querySelector("[data-name]");
        if (nameEl) {
            nameEl.textContent = fileObj.name;
        }
        const sizeEl = newRowEl.querySelector("[data-size]");
        if (sizeEl) {
            sizeEl.textContent = self.upfile.formatToByteStr(fileObj.size);
        }
        const trashEl = newRowEl.querySelector("[data-trash]");
        if (trashEl) {
            trashEl.dataset.id = fileObj.id;
            // Handle Delete:
            trashEl.addEventListener("click", (ev) => {
                const target = ev.target;
                const fileId = target.dataset.id;
                if (fileId) {
                    this.handleFileDelete(fileId);
                }
            });
        }
        console.log("END newRowEl:", newRowEl);
        // add to DOM:?
        this.fileViewerList?.appendChild(newRowEl);
        // make visible:
        newRowEl.style.display = "grid";
        newRowEl.style.opacity = "1";
        // add to Map once rendered
        self.upfile.fileViewerUIMap.set(fileObj.id, newRowEl);
        // ui:
        this.togglePlaceholderUI();
        this.hideLoadingSpinner(fileObj.id);
    }
    deleteFileViewerItem(elementId) {
        if (!this.fileViewerList)
            return; // TODO: add error
        const removableEl = self.upfile.fileViewerUIMap.get(elementId);
        self.upfile.fileViewerUIMap.delete(elementId);
        this.fileViewerList.removeChild(removableEl);
    }
    updateTallyElementText() {
        if (!this.dropzoneFileSizeTally)
            return;
        this.dropzoneFileSizeTally.textContent = self.upfile.formatToByteStr(self.upfile.totalStateFileSize);
    }
    resetDragUI() {
        if (!this.dropzoneSelectBtn || !this.dropzoneBlock || !this.dropzoneText) {
            return;
        }
        this.dropzoneSelectBtn.style.display = "flex";
        this.dropzoneBlock.removeAttribute("data-status");
        this.dropzoneBlock.removeAttribute("data-drag");
        this.dropzoneText.style.display = "none";
        this.dropzoneText.removeAttribute("data-status");
    }
    hideLoadingSpinner(fileId) {
        if (!this.fileViewerList)
            return;
        const fileViewerList = this.fileViewerList.querySelector(`[data-id="${fileId}"]`);
        if (!fileViewerList)
            return;
        fileViewerList.style.display = "none";
    }
    renderLoadingSpinner(el) {
        // el is the element that we will swap for our loading spinner
        if (!this.loadingSpinner)
            return;
        const spinner = this.loadingSpinner.cloneNode(true);
        // Store the original element's parent and next sibling
        const parent = el.parentNode;
        const nextSibling = el.nextSibling;
        if (!parent || !nextSibling)
            return;
        // Temporarily remove the original element
        el.remove();
        // Insert the spinner in its place
        parent.insertBefore(spinner, nextSibling);
        return function disableSpinner() {
            spinner.remove();
            parent.insertBefore(el, nextSibling);
        };
    }
    // tracking index and using fileId
    renderFileViewerSpinners(id, index) {
        if (!this.fileViewerOriginalRow || !this.fileViewerList)
            return;
        const newRow = this.fileViewerOriginalRow.cloneNode(true);
        newRow.id = id;
        newRow.classList.remove("hidden");
        const filenameEl = newRow.querySelector(".upfile__fileviewer_item_name");
        const statusEl = newRow.querySelector(".upfile__fileviewer_item_status");
        if (filenameEl)
            filenameEl.textContent = self.upfile.fileStateObj[id].name;
        if (statusEl) {
            statusEl.textContent = "uploading...";
            statusEl.setAttribute("data-status", "uploading");
        }
        const trashIcon = newRow.querySelector(".upfile__fileviewer_trash_icon");
        if (trashIcon) {
            trashIcon.addEventListener("click", () => {
                this.fileViewerList?.removeChild(newRow);
                self.upfile.deleteFileState(id);
                self.upfile.deleteVariantProps(id);
                this.togglePlaceholderUI();
                this.updateSizeTallyUI();
            });
        }
        this.fileViewerList.insertBefore(newRow, this.fileViewerPlaceholder);
        self.upfile.fileViewerUIMap.set(id, newRow);
    }
    renderErrorMessages(errors) {
        if (!this.fileViewerErrorList || !this.fileViewerErrorItem)
            return;
        this.fileViewerErrorList.innerHTML = ""; // Clear existing errors
        errors.forEach((msg) => {
            if (!this.fileViewerErrorItem)
                return;
            const li = this.fileViewerErrorItem.cloneNode(true);
            li.classList.remove("hidden");
            li.textContent = msg;
            this.fileViewerErrorList?.appendChild(li);
        });
        this.fileViewerErrorList.style.display = "block";
    }
    updateSizeTallyUI() {
        if (this.dropzoneFileSizeTally) {
            this.dropzoneFileSizeTally.textContent = self.upfile.formatToByteStr(self.upfile.totalStateFileSize);
        }
    }
    /* for selected files */
    // async uploadSelectedFiles(fileList: File[]) {
    //   try {
    //     const uploadedFiles = await self.upfile.postFiles(fileList);
    //     uploadedFiles.forEach(({ value, status }) => {
    //       this.addVariantProps(value.id);
    //       self.upfile.updateFileStatus(value.id, status);
    //     });
    //     this.updateSizeTallyUI();
    //     this.togglePlaceholderUI();
    //   } catch (err) {
    //     console.error(err);
    //     this.renderErrorMessages([
    //       "There was an error uploading your files. Please try again.",
    //     ]);
    //   }
    // }
    resetErrorMessageList() {
        self.upfile.errorMessages = [];
        if (!this.fileViewerErrorList)
            return;
        this.fileViewerErrorList.innerHTML = "";
    }
    initEventListeners() {
        this.dropzoneBlock?.addEventListener("dragenter", this.handleDragEnter.bind(this));
        this.dropzoneBlock?.addEventListener("dragover", (ev) => {
            ev.preventDefault();
        });
        this.dropzoneBlock?.addEventListener("dragleave", this.handleDragLeave.bind(this));
        this.dropzoneBlock?.addEventListener("drop", this.handleDrop.bind(this));
        this.dropzoneSelectBtn?.addEventListener("click", (ev) => {
            ev.preventDefault();
            this.dropzoneFileInput?.click();
        });
        this.dropzoneFileInput?.addEventListener("change", (ev) => {
            const input = ev.target;
            const fileArr = Array.from(input.files?.length ? input.files : []);
            this.prepareForPost(fileArr);
            self.upfile.postFiles(self.upfile.formData);
        });
    }
    prepareForPost(files) {
        this.resetErrorMessageList();
        const validFilesArr = files.filter((file) => self.upfile.validateSubmittedFile(file));
        if (self.upfile.errorMessages.length > 0 || validFilesArr.length === 0) {
            return self.upfile.errorMessages;
        }
        Array.from(validFilesArr).forEach((file, i) => {
            if (!self.upfile.validateSubmittedFile(file)) {
                this.renderErrorMessages(self.upfile.errorMessages);
                return;
            }
            const fileId = crypto.randomUUID();
            self.upfile.addFileState(fileId, file);
            self.upfile.formData.append("file_uuid", fileId);
            self.upfile.formData.append("files", file);
            this.renderFileViewerSpinners(fileId, i);
        });
    }
    handleFileResponse(value, status) {
        this.renderFileViewerItem(self.upfile.fileStateObj[value.id]);
        if (self.upfile.updateFileStatus(value.id, status)) {
            this.addVariantProps(value.id);
            this.updateTallyElementText();
        }
    }
    handleFileDelete(id) {
        self.upfile.deleteVariantProps(id);
        this.deleteFileViewerItem(id);
        self.upfile.deleteFileState(id);
        this.updateTallyElementText();
        self.upfile.errorMessages = [];
        this.togglePlaceholderUI();
        self.upfile.deleteFiles([id]);
    }
    handleDragEnter(ev) {
        ev.preventDefault();
        this.dropzoneBlock?.setAttribute("data-drag", "dragging");
        if (!this.dropzoneSelectBtn || !this.dropzoneText)
            return;
        this.dropzoneSelectBtn.style.display = "none";
        const items = ev.dataTransfer?.items;
        if (!items)
            return;
        const fileCount = items.length;
        let txt = "";
        for (const item of items) {
            const isValid = self.upfile.validateDraggedFile(item);
            this.dropzoneBlock?.setAttribute("data-status", isValid ? "valid" : "invalid");
            this.dropzoneText?.setAttribute("data-status", isValid ? "valid" : "invalid");
            txt =
                fileCount > 1
                    ? this.dropzoneText.dataset[isValid ? "validTextPlural" : "invalidTextPlural"]
                    : this.dropzoneText.dataset[isValid ? "validTextSingular" : "invalidTextSingular"];
            this.dropzoneText.textContent = txt;
            this.dropzoneText.style.display = "flex";
            console.log("this.dropzoneText.textContent:", this.dropzoneText?.textContent);
        }
    }
    handleDragLeave(ev) {
        ev.preventDefault();
        this.resetDragUI();
    }
    async handleDrop(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.resetDragUI();
        const files = ev.dataTransfer?.files;
        if (!files) {
            // Non-file items submitted, ignore!
            return;
        }
        this.prepareForPost(Array.from(files));
        const { data, error } = await self.upfile.postFiles(self.upfile.formData);
        // clear form
        if (error || !data) {
            // TODO: show user-friendly retry UI, maybe a toast or dialog
            console.warn("Upload error:", error);
            return;
        }
        data.forEach(({ value, status }) => {
            this.handleFileResponse(value, status);
        });
    }
}
self.addEventListener("upfile:loaded", () => {
    new UpfileBlock();
});
