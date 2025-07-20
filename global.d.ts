// global.d.ts
declare module "*.css";
declare module "fake-tag";

declare global {
  type MetaobjectDefinitionInfo = {
    id: string;
    type: string;
  };
  // used as a reference when merchants try to make new widgets
  interface ShopSettings {
    id: string; // the Metaobject instance!
    type: "upfile-shop-settings"; // corresponds to Shopify type definition
    handle?: string;
    // SHOPIFY-EQUIVALENT DATA:
    "upfile-widgets": UpfileWidget[];
    "setup-guide-progress": StoreSetupGuide;
    "max-file-size": number | null; // global limit
    "max-request-size": number | null; // global limit
    // index by the name, these won't change adn will be the same across installations. This will be cached
    // the value is the gid string:
    "metaobject-definition-index": {
      "Upfile Injection Settings": string;
      "Upfile Block Settings": string;
      "Upfile Widget Data": string;
      "Upfile Shop Settings": string;
    };
    "init-upfile-metafields-defined": boolean;
    "forbidden-file-types": [
      ".js",
      ".exe",
      ".bat",
      ".sh",
      ".php",
      ".html",
      ".bin",
    ];
    "known-cart-drawer-selectors": [
      ".cart-drawer",
      "#CartDrawer",
      "#cart-drawer",
      ".mini-cart",
      ".drawer--cart",
    ];
    "known-cart-drawer-footer-selectors": [
      ".cart__footer",
      ".cart-footer",
      ".drawer__footer",
      ".cart-drawer__footer",
    ];

    // not on init:
    "upfile-subscription-plan":
      | "free"
      | "basic"
      | "business"
      | "enterprise"
      | "legacy"
      | null;
    "app-bridge-enabled"?: boolean | null;
    "theme-block-enabled": boolean | null;
  }

  /**
   * @description an instance of an upfile widget
   * @memory saved as a metaobject on Shopify
   * @keys are made to match the keys in the metadata
   */
  interface UpfileWidget {
    id: string; // must be unique
    type: "$app:upfile-widget-settings";
    "widget-name": string; // must be unique
    "widget-type": "block" | "injection";
    "max-file-size": number;
    "permitted-file-types": Record<string, string> | null;
    "multi-file-submission-enabled": boolean | null;
    "max-file-count": number | null;
    "shadow-root-enabled": boolean;
    // one of the other, user should duplicate if they want to keep everything else the same:
    "block-settings"?: BlockSettings;
    "injection-settings"?: InjectionSettings;

    // Advanced customization:
    // Each widget has their own HTML/CSS
    // stored on Shopify as json with a single KV pair
    "custom-html": {
      customHTML: string;
    };
    "custom-js": {
      customJS: string;
    };
    "custom-css": {
      customCSS: string;
    };
  }

  interface BlockSettings {
    id: string;
    type: "$app:upfile-block-settings";
    // connect widget to the write page/route:
    "block-handle-list": string[];
    "block-extension-enabled": boolean;
    "block-locations": string[] | null; // product, cart
  }

  interface InjectionSettings {
    id: string;
    type: "$app:upfile-injection-settings";
    // connect widget to the right page/route:
    "valid-product-handles": string[]; // e.g., ["custom-product", "engraved-item"]
    "valid-collection-handles": string[]; // e.g., ["custom-collection", "uploadables"]

    // embed:
    "injection-type": "theme_cart" | "app_cart" | null;
    "injection-level": "cart_drawer" | "line_item" | null;
    // otherwise it's PDP, Cart Page and Customer Acc

    // upfile default injection to 'before-start' of the cart footer.
    // TODO: should display warning if we weren't able to automatically identify either of these injection locations

    "cart-injection-root-selector": string | null; // the cart-drawer OVERRIDE
    "cart-injection-ref-element-selector": string | null; // element we're injecting to
    "cart-injection-position": InsertPosition | null; // "beforeend", "afterbegin", etc.

    "line-item-injection-root-selector": string | null; // the cart-drawer
    "line-item-injection-ref-element-selector": string | null; // element we're injecting to
    "line-item-injection-position": InsertPosition | null; // "beforeend", "afterbegin", etc.
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
    Shopify: Shopify;
  }

  interface Shopify {
    shop: string;
    routes: {
      root: "/";
    };
  }

  // Define the ShopSettings interface globally if it's used elsewhere
  interface MerchantData {
    settings: ShopSettings;
    upfilePublicStorefrontAccessToken: string | null;
  }

  interface StoreAdminSettings {
    // these would be settings that only have relevance in the Admin and not be needed in the app blocks
    // admin UI persistent state etc.
    feedbackProvided: boolean;
    feedbackGiven: "Good" | "Bad";
  }

  interface StoreSetupGuide {
    // ! make any block keys the same as their handle for convenience!
    "upfile-app-bridge-embed": boolean;
    "location-selected": boolean;
    "plan-selected": boolean;
    "init-setup-complete": boolean;
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

/* 
TODO: widget settings form admin app:


  "settings": [
      {
        "type": "header",
        "content": "General Settings"
      },
      {
        "type": "radio",
        "id": "block-orientation",
        "label": "Orientation",
        "options": [
          {
            "label": "Row",
            "value": "row"
          }, {
            "label": "Column",
            "value": "column"
          }, {
            "label": "Reverse Row",
            "value": "row-reverse"
          }
        ],
        "info": "NOTE: Row blocks will wrap if your screen is too narrow",
        "default": "column"
      },
      {
        "type": "radio",
        "id": "horizontal-alignment",
        "label": "Horizontal Alignment",
        "options": [
          {
            "label": "Left",
            "value": "flex-start"
          }, {
            "label": "Center",
            "value": "center"
          }, {
            "label": "Right",
            "value": "flex-end"
          }, {
            "label": "Spread",
            "value": "space-between"
          }
        ],
        "default": "center"
      },
      {
        "type": "radio",
        "id": "vertical-alignment",
        "label": "Vertical Alignment",
        "options": [
          {
            "label": "Top",
            "value": "flex-start"
          }, {
            "label": "Center",
            "value": "center"
          }, {
            "label": "Bottom",
            "value": "flex-end"
          }, {
            "label": "Height Stretch",
            "value": "stretch"
          }
        ],
        "default": "center"
      }, {
        "type": "range",
        "id": "block-top-padding",
        "label": "Block Top Padding",
        "default": 4,
        "step": 1,
        "min": 0,
        "max": 50
      }, {
        "type": "range",
        "id": "block-bottom-padding",
        "label": "Block Bottom Padding",
        "default": 4,
        "step": 1,
        "min": 0,
        "max": 50
      }, {
        "type": "range",
        "id": "app-bottom-margin",
        "label": "App Bottom Margin",
        "default": 4,
        "step": 1,
        "min": 0,
        "max": 50
      }, {
        "type": "range",
        "id": "app-top-margin",
        "label": "App Top Margin",
        "default": 4,
        "step": 1,
        "min": 0,
        "max": 50
      }, {
        "type": "range",
        "id": "sub-block-gap",
        "label": "Sub-Block Gap",
        "default": 4,
        "step": 1,
        "min": 0,
        "max": 20
      }, {
        "type": "checkbox",
        "id": "app-divider-top",
        "label": "App Divider Top",
        "default": false
      }, {
        "type": "checkbox",
        "id": "app-divider-bottom",
        "label": "App Divider Bottom",
        "default": false
      }, {
        "type": "header",
        "content": "Dropzone Sub-block"
      }, {
        "type": "text",
        "id": "valid-text-singular",
        "label": "File Valid Text - Singular",
        "default": "🎉 File is valid!"
      }, {
        "type": "text",
        "id": "valid-text-plural",
        "label": "Files Valid Text - Plural",
        "default": "🎉 Files are valid!"
      }, {
        "type": "text",
        "id": "invalid-text-singular",
        "label": "File Invalid text - Singular",
        "default": "👎Oops.. this isn't a valid file"
      }, {
        "type": "text",
        "id": "invalid-text-plural",
        "label": "File Invalid text - Plural",
        "default": "👎Oops.. these aren't valid files"
      }, {
        "type": "number",
        "id": "font-size",
        "label": "Font Size",
        "info": "Font Size in pixels",
        "default": 16
      }, {
        "type": "color",
        "id": "default-btn-color",
        "label": "Color of the Button",
        "default": "#121212"
      }, {
        "type": "text",
        "id": "button-text",
        "label": "Button Text",
        "default": "Select or Drop Files"
      }, {
        "type": "text",
        "id": "disclaimer-text",
        "label": "the text below the button",
        "default": "(max 20MB per file)"
      }, {
        "type": "header",
        "content": "Fileviewer Sub-block"
      }, {
        "type": "color",
        "id": "primary-color",
        "label": "Primary File Color",
        "default": "#3d3d3d"
      }, {
        "type": "color",
        "id": "secondary-color",
        "label": "Secondary File Color",
        "default": "#535353"
      }, {
        "type": "color",
        "id": "font-color",
        "label": "Icon Font Color",
        "default": "#FFFFFF"
      }, {
        "type": "text",
        "id": "fileviewer-text",
        "label": "Placeholder Text",
        "default": "Submitted files appear here"
      }
    ]
  }
{% endschema %}


*/
