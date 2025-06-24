// global.d.ts
declare module "*.css";
declare module "fake-tag";

declare global {
  // ! ADMIN APP DATA:
  // the admin app data / metafields
  interface UpfileApp {
    themeBlockWidgets: { [key: string]: UpfileWidget };
    injectedWidgets: { [key: string]: UpfileWidget };
    hasInjectionWidget: boolean;
    shadowRootEnabled: boolean;
    setupGuideProgress: StoreSetupGuide;
    settings: MerchantSettings;
  }

  // used for the Settings Page AND in the app blocks
  interface MerchantSettings {
    forbiddenFileTypes: [".js", ".exe", ".bat", ".sh", ".php", ".html", ".bin"];
    maxWidgetCount: number | null;
    maxFileSize: number | null;
    maxRequestSize: number | null; // by Plan
    subscriptionPlan: "free" | "basic" | "business" | "enterprise" | null;
    // ui related:
    // mandatory:
    appBridgeEnabled: boolean | null; // just the embed/logic
    themeBlockEnabled: boolean | null;
    upfileWidgets: UpfileWidget[]; // all of the widgets the merchant has added
  }

  /**
   * @description an instance of an upfile widget
   * @memory saved as a metaobject on Shopify
   */
  interface UpfileWidget {
    id: string;
    permittedFileTypes: Record<string, string> | null;
    multiFileSubmissionEnabled: boolean | null;

    maxFileCount: number | null;
    // block:
    blockExtensionEnabled: boolean;
    blockLocation: string[] | null; // product, cart
    // embed:
    injectionType: "theme_cart" | "app_cart" | null;
    injectionLevel: "cart_drawer" | "line_item" | null;
    // otherwise it's PDP, Cart Page and Customer Acc

    knownCartDrawerSelectors: ".cart-drawer, #CartDrawer, #cart-drawer, .mini-cart, .drawer--cart";

    knownCartDrawerFooterSelectors: ".cart__footer, .cart-footer, .drawer__footer, .cart-drawer__footer";
    // upfile default injection to 'before-start' of the cart footer.
    // TODO: should display warning if we weren't able to automatically identify either of these injection locations

    cartInjectionRootSelector: string | null; // the cart-drawer OVERRIDE
    cartInjectionRefElementSelector: string | null; // element we're injecting to
    cartInjectionPosition: InsertPosition | null; // "beforeend, "afterbegin", etc

    lineItemInjectionRootSelector: string | null; // the cart-drawer
    lineItemInjectionRefElementSelector: string | null; // element we're injecting to
    lineItemInjectionPosition: InsertPosition | null; // "beforeend, "afterbegin", etc

    // features:
    imagePreviewEnabled: boolean;
    imageCropperEnabled: boolean;

    // Advanced customization:
    customHTML: string;
    customJS: string;
    customCSS: string;
  }

  /**
   * @description this is an optional add-on script that injects an overlay
   * on top of the merchant's PDP images.
   * - image editor should make the top level product image position:relative
   */
  interface ImageEditorBlock {}

  // ! CLIENT DATA:
  interface Window {
    upfile: UpfileAppBridge;
  }

  // Define the MerchantSettings interface globally if it's used elsewhere
  interface MerchantData {
    settings: MerchantSettings;
    upfilePublicStorefrontAccessToken: string | null;
  }

  interface StoreAdminSettings {
    // these would be settings that only have relevance in the Admin and not be needed in the app blocks
    // admin UI persistent state etc.
    feedbackProvided: boolean;
    feedbackGiven: "Good" | "Bad";
  }

  interface StoreSetupGuide {
    appBridgeActive: boolean;
    locationSelected: boolean;
    planSelected: boolean;
    setupComplete: boolean;
  }

  interface UpfileStorePlan {
    [key: string]: {};
  }

  interface FilesPage {
    storageAvailable: number;
    storageUsed: number;
    storageAllocated: number;
    files: UpfileFileRecord[] | null; // if null render empty state
  }

  interface UpfileFileRecord {
    customer: Customer;
    orderTotal: number;
    upfileOrderNumber: number; // will link to OUR
  }

  interface OrdersPage {}

  interface ProductsPage {}

  interface PlanPage {}

  interface ShopData {
    shopId: string;
    name: string;
    createdAt: string;
    planName: string;
    isPartner: boolean;
    isShopifyPlus: boolean;
  }

  interface SessionState {
    errorMessages: string[];
    fileNameSet: Set<string>;
    fileViewerUIMap: Map<string, HTMLElement>;
    fileStateObj: Record<string, FileState>;
    totalStateFileSize: number;
    formData: FormData;
    cart: Cart | null;
  }

  type FileStatus = "success" | "failed" | "fulfilled" | null;

  interface FileState {
    id: string;
    name: string;
    size: number;
    type: string;
    status: FileStatus;
  }

  interface FileDetails {
    _id: string; // UUID
    filename: string;
    storeId: string; // references the store the files belong to
    uploadedAt: string;
    lineItemId: string | null; // the line item the file belongs to
    // once order placed:
    orderId: string | null; // null until the order comes through
  }

  // would be easy to just GET the stores data on load
  interface MerchantStore {
    _id: string;
    files: FileDetails[];
    permittedFiles: {
      [key: string]: string;
    };

    // ! all this stuff will be added onInstall
    // storeDomain: string; // the .myshopify.com id
    // shopifyPlan: string;
    // dateCreated: string; // when they installed the app

    // appPlan: string; // our plan tier: free, basic, business, advanced
    // chargeId: string;
    // status: string; // active, pending, cancelled
    // ownerEmail?: string; // can I and should I store this?
  }

  type BBFile = {
    filename: string;
    encoding: string;
    mimeType: string;
  };

  interface Merchant {
    _id: string;
  }

  interface BlockInjection {
    parentSelector: string;
    embedInjectionLocation: string;
  }

  interface PostFileResponse {
    data: UploadedFile[] | null;
    status?: string;
    error?: string;
  }

  interface DeleteFileResponse {
    id: string;
    status: "rejected";
    reason?: string;
  }

  interface DeleteFilesResult {
    failed: DeleteFileResponse[]; // only failed ones
    error?: string;
  }

  interface FileData {
    value: { id: string };
    status: FileStatus;
  }

  interface FileViewerRowElement extends HTMLElement {
    dataset: DOMStringMap;
  }

  interface Cart {
    token: string;
    note: string;
    attributes: Record<string, string>;
    original_total_price: number;
    total_price: number;
    total_discount: number;
    total_weight: number;
    item_count: number;
    items: CartItem[];
    requires_shipping: boolean;
    currency: string;
    items_subtotal_price: number;
    cart_level_discount_applications: {
      type: string;
      key: string;
      title: string;
      description: string;
      value: string;
      created_at: string;
      value_type: string;
      allocation_method: string;
      target_selection: string;
      target_type: string;
      total_allocated_amount: number;
    }[];
  }

  interface CartItem {
    id: number;
    title: string;
    key: string;
    price: number;
    line_price: number;
    quantity: number;
    sku: string | null;
    grams: number;
    vendor: string;
    properties: Record<string, string> | null;
    variant_id: number;
    gift_card: boolean;
    url: string;
    featured_image: {
      url: string;
      aspect_ratio: number;
      alt: string;
    };
    image: string;
    handle: string;
    requires_shipping: boolean;
    product_title: string;
    product_description: string;
    product_type: string;
    variant_title: string;
    variant_options: string[];
    options_with_values: {
      name: string;
      value: string;
    }[];
  }
}

export {}; // Ensures this file is treated as a module to apply the global declaration
