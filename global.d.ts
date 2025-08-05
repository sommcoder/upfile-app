// global.d.ts
declare module "*.css";
declare module "fake-tag";

declare global {
  type MetaobjectDefinitionInfo = {
    id: string;
    type: string;
  };

  interface ShopSettings {
    id: string;
    type: "upfileShopSettings";
    handle?: string;
    upfileWidgets: UpfileWidget[];
    setupGuideProgress: StoreSetupGuide;
    maxFileSize: number | null;
    maxRequestSize: number | null;
    metaobjectDefinitionIndex: {
      upfileInjectionSettings: string;
      upfileBlockSettings: string;
      upfileWidgetData: string;
      upfileShopSettings: string;
    };
    initUpfileMetafieldsDefined: boolean;
    forbiddenFileTypes: [".js", ".exe", ".bat", ".sh", ".php", ".html", ".bin"];
    knownCartDrawerSelectors: [
      ".cart-drawer",
      "#CartDrawer",
      "#cart-drawer",
      ".mini-cart",
      ".drawer--cart",
    ];
    knownCartDrawerFooterSelectors: [
      ".cart__footer",
      ".cart-footer",
      ".drawer__footer",
      ".cart-drawer__footer",
    ];
    upfileSubscriptionPlan:
      | "free"
      | "basic"
      | "business"
      | "enterprise"
      | "legacy"
      | null;
    appBridgeEnabled?: boolean | null;
    themeBlockEnabled: boolean | null;
  }

  interface UpfileWidget {
    id: string;
    type: "$app:upfileWidgetSettings";
    widgetName: string;
    widgetType: "block" | "injection";
    maxFileSize: number;
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
  }

  interface BlockSettings {
    id: string;
    type?: "$app:upfileBlockSettings";
    blockHandleList: string[];
    blockExtensionEnabled: boolean;
    blockLocations: string[] | null;
  }

  interface InjectionSettings {
    id: string;
    type: "$app:upfileInjectionSettings";
    validProductHandles: string[];
    validCollectionHandles: string[];
    injectionType: "theme_cart" | "app_cart" | null;
    injectionLevel: "cart_drawer" | "line_item" | null;
    cartInjectionRootSelector: string | null;
    cartInjectionRefElementSelector: string | null;
    cartInjectionPosition: InsertPosition | null;
    lineItemInjectionRootSelector: string | null;
    lineItemInjectionRefElementSelector: string | null;
    lineItemInjectionPosition: InsertPosition | null;
  }

  interface ImageEditorBlock {}

  interface Window {
    upfile: UpfileAppBridge;
    Shopify: Shopify;
  }

  interface Shopify {
    shop: string;
    routes: {
      root: "/";
    };
  }

  interface MerchantData {
    settings: ShopSettings;
    upfilePublicStorefrontAccessToken: string | null;
  }

  interface StoreAdminSettings {
    feedbackProvided: boolean;
    feedbackGiven: "Good" | "Bad";
  }

  interface StoreSetupGuide {
    upfileAppBridgeEmbed: boolean;
    upfileThemeBlock: boolean;
    locationSelected: boolean;
    planSelected: boolean;
    initSetupComplete: boolean;
  }

  interface UpfileStorePlan {
    [key: string]: {};
  }

  interface FilesPage {
    storageAvailable: number;
    storageUsed: number;
    storageAllocated: number;
    files: UpfileFileRecord[] | null;
  }

  interface UpfileFileRecord {
    customer: Customer;
    orderTotal: number;
    upfileOrderNumber: number;
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
    _id: string;
    filename: string;
    storeId: string;
    uploadedAt: string;
    lineItemId: string | null;
    orderId: string | null;
  }

  interface MerchantStore {
    _id: string;
    files: FileDetails[];
    permittedFiles: {
      [key: string]: string;
    };
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
    failed: DeleteFileResponse[];
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

  type GQL_BODY = {
    defType?: string;
    query: string;
    variables: Record<string, any>;
  };
}

export {};
