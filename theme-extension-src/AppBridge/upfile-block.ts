/**
 * @purpose this is the injected block if merchants would rather inject to a specific location instead of using a Shopify App Block
 */
export class UpfileBlock {
  // Root Elements:
  dropzoneBlock: HTMLElement | null = null;
  fileViewerBlock: HTMLElement | null = null;
  hiddenInput: HTMLInputElement | null = null;

  // Root Elements (Conditional)
  productForm: HTMLFormElement | null = null;
  cartRoot: HTMLElement | null = null;

  // dropzone elements:
  dropzoneFileInput: HTMLInputElement | null = null;
  dropzoneHelpText: HTMLElement | null = null;
  dropzoneText: HTMLElement | null = null;
  dropzoneSelectBtn: HTMLElement | null = null;
  dropzoneFileSizeTally: HTMLElement | null = null;
  dropzoneFileSizeMax: HTMLElement | null = null;

  // fileviewer elements:
  fileViewerList: HTMLElement | null = null;
  fileViewerOriginalRow: HTMLElement | null = null;
  fileViewerTrashIcon: HTMLElement | null = null;
  fileViewerStatus: HTMLElement | null = null;
  loadingSpinner: HTMLElement | null = null;
  fileViewerPlaceholder: HTMLElement | null = null;
  fileViewerErrorList: HTMLElement | null = null;
  fileViewerErrorItem: HTMLElement | null = null;

  constructor() {
    console.log("app block constructing...");

    // only need to be concerned about productForm when we AREN'T injecting into a cart-drawer

    /*
     
    1) won't need to add hidden input to product form
    2) we can just directly add the __hidden input to the whole cart
     

    TODO: any way we can make this work agnostically to the root and hidden element inside it?
    */
    console.log(
      "self.upfile.settings.cartInjectionRootSelector:",
      self.upfile.settings.cartInjectionRootSelector,
    );

    if (self.upfile.cart) {
      // get the cart
      this.cartRoot = document.querySelector(
        self.upfile.settings.cartInjectionRootSelector || '[id*="cart" i]',
      );
    } else {
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
      this.dropzoneFileInput = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_manual_file_input",
      );
      this.dropzoneHelpText = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_help_text",
      );
      this.dropzoneText = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_text",
      );
      console.log("this.dropzoneText:", this.dropzoneText);

      this.dropzoneSelectBtn = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_select_file_btn",
      );

      this.dropzoneFileSizeTally = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_file_size_tally",
      );
      this.dropzoneFileSizeMax = this.dropzoneBlock.querySelector(
        "#upfile__dropzone_file_size_max",
      );

      // fileviewer:
      this.fileViewerList = this.fileViewerBlock.querySelector(
        "#upfile__fileviewer_item_list",
      );

      if (!this.fileViewerList) return;

      this.fileViewerOriginalRow = this.fileViewerList.querySelector(
        ".upfile__fileviewer_item_row",
      );
      this.fileViewerTrashIcon = this.fileViewerList?.querySelector(
        ".upfile__fileviewer_trash_icon",
      );
      this.fileViewerStatus = this.fileViewerList.querySelector(
        ".upfile__fileviewer_item_status",
      );

      /* we can clone the spinner to use in dropzone */
      this.loadingSpinner =
        this.fileViewerList.querySelector(".upfile__spinner");

      this.fileViewerPlaceholder = this.fileViewerList.querySelector(
        "#upfile__fileviewer_placeholder",
      );
      this.fileViewerErrorList = this.fileViewerBlock.querySelector(
        "#upfile__fileviewer_error_list",
      );
      this.fileViewerErrorItem = this.fileViewerBlock.querySelector(
        ".upfile__fileviewer_error_item",
      );

      this.initEventListeners();
      if (this.isInAppBrowser()) {
        // change the 'select file' onClick() to open the user's default browser
        // openInDefaultBrowser()
      }
    } else {
      const dropzoneNotice = this.dropzoneBlock?.querySelector(
        "#upfile__dropzone_missing_block_notice",
      );
      if (dropzoneNotice instanceof HTMLElement) {
        dropzoneNotice.style.display = "flex";
        if (!this.dropzoneBlock) return;

        const firstChild = this.dropzoneBlock.firstElementChild;
        // Ensure that firstChild is not null and is an HTMLElement
        if (firstChild instanceof HTMLElement) {
          firstChild.style.display = "none"; // Hide the first child element
        }
      }
      const fileViewerNotice = this.fileViewerBlock?.querySelector(
        "#upfile__dropzone_missing_block_notice",
      );
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

  insertAppBlock(element: HTMLElement | null) {
    if (!element) {
      return;
    }
    console.log("element:", element);

    element.insertAdjacentHTML(
      self.upfile.settings.cartInjectionPosition || "beforeend",
      self.upfile.settings.customHTML || "",
    );
  }

  isInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor;
    return /FBAN|FBAV|Instagram|Line|Twitter|Snapchat|TikTok/i.test(ua);
  }

  openInDefaultBrowser() {
    const currentUrl = window.location.href;
    const newWindow = window.open(currentUrl, "_blank");

    // If popup blocked or fails, fall back:
    if (
      !newWindow ||
      newWindow.closed ||
      typeof newWindow.closed === "undefined"
    ) {
      alert("Please open this page in your browser for the best experience.");
    }
  }

  // TODO: just UI methods, anything state related would be called from self.upfile
  togglePlaceholderUI() {
    if (!this.fileViewerPlaceholder) return;
    if (self.upfile.fileViewerUIMap.size === 0) {
      this.fileViewerPlaceholder.style.display = "flex";
    } else if (self.upfile.fileViewerUIMap.size === 1) {
      this.fileViewerPlaceholder.style.display = "none";
    }
  }

  addVariantProps(id: string) {
    // product form or hidden input in cart
    if (this.productForm) {
      this.hiddenInput = this.productForm.querySelector<HTMLInputElement>(
        "input[name='properties[__upfile_id]']",
      );
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
    } else {
      this.hiddenInput.value += `,${id}`;
    }
  }

  renderFileViewerItem(fileObj: FileState) {
    let newRowEl = this.fileViewerOriginalRow?.cloneNode(
      true,
    ) as FileViewerRowElement | null;

    console.log("START newRowEl:", newRowEl);
    if (!newRowEl || newRowEl === null) {
      return;
    }
    // update data:
    newRowEl.dataset.id = fileObj.id;

    // Safely set dataset and textContent
    const nameEl = newRowEl.querySelector<HTMLElement>("[data-name]");
    if (nameEl) {
      nameEl.textContent = fileObj.name;
    }

    const sizeEl = newRowEl.querySelector<HTMLElement>("[data-size]");
    if (sizeEl) {
      sizeEl.textContent = self.upfile.formatToByteStr(fileObj.size);
    }

    const trashEl = newRowEl.querySelector<HTMLElement>("[data-trash]");
    if (trashEl) {
      trashEl.dataset.id = fileObj.id;

      // Handle Delete:
      trashEl.addEventListener("click", (ev) => {
        const target = ev.target as HTMLElement;
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

  deleteFileViewerItem(elementId: string) {
    if (!this.fileViewerList) return; // TODO: add error
    const removableEl = self.upfile.fileViewerUIMap.get(
      elementId,
    ) as HTMLElement;
    self.upfile.fileViewerUIMap.delete(elementId);
    this.fileViewerList.removeChild(removableEl);
  }

  updateTallyElementText() {
    if (!this.dropzoneFileSizeTally) return;
    this.dropzoneFileSizeTally.textContent = self.upfile.formatToByteStr(
      self.upfile.totalStateFileSize,
    );
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

  hideLoadingSpinner(fileId: string) {
    if (!this.fileViewerList) return;
    const fileViewerList = this.fileViewerList.querySelector(
      `[data-id="${fileId}"]`,
    ) as HTMLElement;

    if (!fileViewerList) return;
    fileViewerList.style.display = "none";
  }

  renderLoadingSpinner(el: HTMLElement) {
    // el is the element that we will swap for our loading spinner
    if (!this.loadingSpinner) return;
    const spinner = this.loadingSpinner.cloneNode(true) as HTMLElement;

    // Store the original element's parent and next sibling
    const parent = el.parentNode;
    const nextSibling = el.nextSibling;
    if (!parent || !nextSibling) return;
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
  renderFileViewerSpinners(id: string, index: number) {
    if (!this.fileViewerOriginalRow || !this.fileViewerList) return;

    const newRow = this.fileViewerOriginalRow.cloneNode(true) as HTMLElement;
    newRow.id = id;
    newRow.classList.remove("hidden");
    const filenameEl = newRow.querySelector(".upfile__fileviewer_item_name");
    const statusEl = newRow.querySelector(".upfile__fileviewer_item_status");

    if (filenameEl) filenameEl.textContent = self.upfile.fileStateObj[id].name;
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

    this.fileViewerList.insertBefore(newRow, this.fileViewerPlaceholder!);
    self.upfile.fileViewerUIMap.set(id, newRow);
  }

  renderErrorMessages(errors: string[]) {
    if (!this.fileViewerErrorList || !this.fileViewerErrorItem) return;

    this.fileViewerErrorList.innerHTML = ""; // Clear existing errors

    errors.forEach((msg) => {
      if (!this.fileViewerErrorItem) return;
      const li = this.fileViewerErrorItem.cloneNode(true) as HTMLElement;
      li.classList.remove("hidden");
      li.textContent = msg;
      this.fileViewerErrorList?.appendChild(li);
    });

    this.fileViewerErrorList.style.display = "block";
  }

  updateSizeTallyUI() {
    if (this.dropzoneFileSizeTally) {
      this.dropzoneFileSizeTally.textContent = self.upfile.formatToByteStr(
        self.upfile.totalStateFileSize,
      );
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
    if (!this.fileViewerErrorList) return;
    this.fileViewerErrorList.innerHTML = "";
  }

  initEventListeners(): void {
    this.dropzoneBlock?.addEventListener(
      "dragenter",
      this.handleDragEnter.bind(this),
    );

    this.dropzoneBlock?.addEventListener("dragover", (ev: DragEvent) => {
      ev.preventDefault();
    });

    this.dropzoneBlock?.addEventListener(
      "dragleave",
      this.handleDragLeave.bind(this),
    );

    this.dropzoneBlock?.addEventListener("drop", this.handleDrop.bind(this));

    this.dropzoneSelectBtn?.addEventListener("click", (ev: MouseEvent) => {
      ev.preventDefault();
      this.dropzoneFileInput?.click();
    });

    this.dropzoneFileInput?.addEventListener("change", (ev: Event) => {
      const input = ev.target as HTMLInputElement;
      const fileArr = Array.from(input.files?.length ? input.files : []);

      this.prepareForPost(fileArr);
      self.upfile.postFiles(self.upfile.formData);
    });
  }

  prepareForPost(files: File[]) {
    this.resetErrorMessageList();

    const validFilesArr = files.filter((file) =>
      self.upfile.validateSubmittedFile(file),
    );

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

  handleFileResponse(value: { id: string }, status: FileStatus): void {
    this.renderFileViewerItem(self.upfile.fileStateObj[value.id]);
    if (self.upfile.updateFileStatus(value.id, status)) {
      this.addVariantProps(value.id);
      this.updateTallyElementText();
    }
  }

  handleFileDelete(id: string): void {
    self.upfile.deleteVariantProps(id);
    this.deleteFileViewerItem(id);
    self.upfile.deleteFileState(id);
    this.updateTallyElementText();
    self.upfile.errorMessages = [];
    this.togglePlaceholderUI();
    self.upfile.deleteFiles([id]);
  }

  handleDragEnter(ev: DragEvent): void {
    ev.preventDefault();
    this.dropzoneBlock?.setAttribute("data-drag", "dragging");
    if (!this.dropzoneSelectBtn || !this.dropzoneText) return;

    this.dropzoneSelectBtn.style.display = "none";

    const items = ev.dataTransfer?.items as DataTransferItemList;
    if (!items) return;

    const fileCount = items.length;
    let txt = "";

    for (const item of items) {
      const isValid = self.upfile.validateDraggedFile(item);
      this.dropzoneBlock?.setAttribute(
        "data-status",
        isValid ? "valid" : "invalid",
      );
      this.dropzoneText?.setAttribute(
        "data-status",
        isValid ? "valid" : "invalid",
      );

      txt =
        fileCount > 1
          ? this.dropzoneText.dataset[
              isValid ? "validTextPlural" : "invalidTextPlural"
            ]!
          : this.dropzoneText.dataset[
              isValid ? "validTextSingular" : "invalidTextSingular"
            ]!;
      this.dropzoneText.textContent = txt;
      this.dropzoneText.style.display = "flex";

      console.log(
        "this.dropzoneText.textContent:",
        this.dropzoneText?.textContent,
      );
    }
  }

  handleDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.resetDragUI();
  }

  async handleDrop(ev: DragEvent): Promise<void> {
    ev.preventDefault();
    ev.stopPropagation();
    this.resetDragUI();

    const files: FileList | undefined = ev.dataTransfer?.files;
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

    data.forEach(
      ({ value, status }: { value: { id: string }; status: any }) => {
        this.handleFileResponse(value, status);
      },
    );
  }
}

// TODO: parse through this and determine what needs to be obtained from Settings
const HTML = `
  <div
    id="upfile__block"
    data-upfile-widget-id="{{ block.id }}"
    style="flex-direction: {{ block.settings['block-orientation'] }};
  {%- if block.settings['block-orientation'] == 'column' -%}
    justify-content: {{ block.settings['vertical-alignment'] }};
    align-items: {{ block.settings['horizontal-alignment'] }};
  {%- else -%}
    justify-content: {{ block.settings['horizontal-alignment'] }};
    align-items: {{ block.settings['vertical-alignment'] }};
  {%- endif -%}; gap: {{ block.settings['sub-block-gap'] }}px; padding: {{block.settings['block-top-padding'] }}px 0px {{ block.settings['block-bottom-padding'] }}px 0px;">

    <div class="upfile__skeleton dropzone"></div>
    <form id="upfile__dropzone">
      <div class="upfile__spinner" data-id=""></div>
      <input
        type="file"
        id="upfile__dropzone_manual_file_input"
        multiple
        style="display: none;" />
      <span id="upfile__dropzone_help_text"></span>
      <span id="upfile__dropzone_middle_wrapper">
        <span
          id="upfile__dropzone_text"
          data-valid-text-singular="{{- block.settings.valid-text-singular -}}"
          data-valid-text-plural="{{- block.settings.valid-text-plural -}}"
          data-invalid-text-singular="{{- block.settings.invalid-text-singular -}}"
          data-invalid-text-plural="{{- block.settings.invalid-text-plural -}}"></span>
        <button id="upfile__dropzone_select_file_btn" style="background-color: {{- block.settings.default-btn-color -}}">
          {{ block.settings.button-text }}
        </button>
      </span>
      <span id="upfile__dropzone_file_size_tally_container">
        <span id="upfile__dropzone_file_size_tally">0.00</span>
        <span>of</span>
        <span id="upfile__dropzone_file_size_max">0.00</span>
      </span>
    </form>

    <span id="upfile__fileviewer">
      <div class="upfile__skeleton fileviewer"></div>
      <div id="upfile__fileviewer_item_list">
        <div class="upfile__fileviewer_item_row">
          <span class="upfile__fileviewer_left_section">
            <span class="upfile__fileviewer_file_thumbnail_wrapper">
              <img
                class="upfile__fileviewer_file_thumbnail_image"
                width="100%"
                height="100%"
                alt="" />
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
              src="{{ 'trash-icon.svg' | asset_url }}"
              height="15px"
              width="15px" />
          </span>
        </div>
        <div class="upfile__spinner" data-id=""></div>
        <div id="upfile__fileviewer_placeholder">
          {{ block.settings.fileviewer-text }}
        </div>
      </div>
      <div id="upfile__fileviewer_error_list">
        <div class="upfile__fileviewer_error_item">
          <img
            src="{{ 'file-error-icon.svg' | asset_url }}"
            height="15px"
            width="15px" />
          <span class="upfile__fileviewer_error_text"></span>
        </div>
      </div>
    </span>
  </div>
`;
