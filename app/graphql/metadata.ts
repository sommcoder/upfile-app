/**
 *@CREATE DATA DEFINITIONS
 */

/*

      "metaobjectDefinition": {
        "id": "gid://shopify/MetaobjectDefinition/8187019449",
        "name": "Upfile Injection Settings",
        "type": ?
 
*/
export const defineInjectionSettingsObj = (): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      mutation CreateMetaobjectDefinition(
        $definition: MetaobjectDefinitionCreateInput!
      ) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition {
            id
            type
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    variables: {
      "definition": {
        "name": "Upfile Injection Settings",
        "type": "upfile-injection-settings",
        "access": {
          "storefront": "PUBLIC_READ"
        },
        "fieldDefinitions": [
          {
            "name": "Valid Product Handles",
            "key": "valid-product-handles",
            "type": "list.single_line_text_field"
          },
          {
            "name": "Valid Collection Handles",
            "key": "valid-collection-handles",
            "type": "list.single_line_text_field"
          },
          {
            "name": "Injection Type",
            "key": "injection-type",
            "type": "single_line_text_field"
          },
          {
            "name": "Injection Level",
            "key": "injection-level",
            "type": "single_line_text_field"
          },
          {
            "name": "Cart Injection Root Selector",
            "key": "cart-injection-root-selector",
            "type": "single_line_text_field"
          },
          {
            "name": "Cart Injection Ref Element Selector",
            "key": "cart-injection-ref-element-selector",
            "type": "single_line_text_field"
          },
          {
            "name": "Cart Injection Position",
            "key": "cart-injection-position",
            "type": "single_line_text_field"
          },
          {
            "name": "Line Item Injection Root Selector",
            "key": "line-item-injection-root-selector",
            "type": "single_line_text_field"
          },
          {
            "name": "Line Item Injection Ref Element Selector",
            "key": "line-item-injection-ref-element-selector",
            "type": "single_line_text_field"
          },
          {
            "name": "Line Item Injection Position",
            "key": "line-item-injection-position",
            "type": "single_line_text_field"
          }
        ]
      }
    }
  };
};

/*
        "id": "gid://shopify/MetaobjectDefinition/8187052217",
        "name": "Upfile Block Settings",
        "type": "app--2315872--upfile-block-settings"
}
*/
export const defineBlockSettingsObj = (): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      mutation CreateMetaobjectDefinition(
        $definition: MetaobjectDefinitionCreateInput!
      ) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition {
            id
            type
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    variables: {
      "definition": {
        "name": "Upfile Block Settings",
        "type": "upfile-block-settings",
        "access": {
          "storefront": "PUBLIC_READ"
        },
        "fieldDefinitions": [
          {
            "name": "Block Handle List",
            "key": "block-handle-list",
            "type": "list.single_line_text_field"
          },
          {
            "name": "Block Extension Enabled",
            "key": "block-extension-enabled",
            "type": "boolean"
          },
          {
            "name": "Block Locations",
            "key": "block-locations",
            "type": "list.single_line_text_field"
          }
        ]
      }
    }
  };
};

/*
     "id": "gid://shopify/MetaobjectDefinition/8356200633",
        "name": "Upfile Widget Data",
        "type": "app--2315872--upfile-widget-settings"
   
    
*/
export const defineWidgetSettingsObj = (
  injectDefId: string,
  blockDefId: string
): GQL_BODY => {
  // pass in the gid's from the return of defineBlockSettingsObj() and defineInjectionSettingsObj()

  return {
    query: /* GraphQL */ `
      mutation CreateMetaobjectDefinition(
        $definition: MetaobjectDefinitionCreateInput!
      ) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition {
            id
            type
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    variables: {
      "definition": {
        "name": "Upfile Widget Data",
        "type": "upfile-widget-settings",
        "access": {
          "storefront": "PUBLIC_READ"
        },
        "fieldDefinitions": [
          {
            "name": "Block Settings",
            "key": "block-settings",
            "type": "metaobject_reference",
            "validations": [
              {
                "name": "metaobject_definition_id",
                "value": `${blockDefId}`
              }
            ]
          },
          {
            "name": "Injection Settings",
            "key": "injection-settings",
            "type": "metaobject_reference",
            "validations": [
              {
                "name": "metaobject_definition_id",
                "value": `${injectDefId}`
              }
            ]
          },
          {
            "name": "Widget Name",
            "key": "widget-name",
            "type": "single_line_text_field"
          },
          {
            "name": "Widget Type",
            "key": "widget-type",
            "type": "single_line_text_field"
          },
          {
            "name": "Max File Size",
            "key": "max-file-size",
            "type": "number_integer"
          },
          {
            "name": "Multi File Submission Enabled",
            "key": "multi-file-submission-enabled",
            "type": "boolean"
          },
          {
            "name": "Shadow Root Enabled",
            "key": "shadow-root-enabled",
            "type": "boolean"
          },
          {
            "name": "Max File Count",
            "key": "max-file-count",
            "type": "number_integer"
          },
          {
            "name": "Custom HTML",
            "key": "custom-html",
            "type": "json"
          },
          {
            "name": "Custom JS",
            "key": "custom-js",
            "type": "json"
          },
          {
            "name": "Custom CSS",
            "key": "custom-css",
            "type": "json"
          }
        ]
      }
    }
  };
};

// ! get definitions by TYPE
// ! get instances by TYPE and HANDLE
// ! ADD instances by TYPE and then the Handle will be unique if not specified

/*
        "id": "gid://shopify/MetaobjectDefinition/8356364473",
        "name": "Upfile Shop Settings",
        "type": "app--2315872--upfile-shop-settings"
*/
// upfile-shop-settings
export const defineShopSettingsObj = (widgetId: string): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      mutation CreateMetaobjectDefinition(
        $definition: MetaobjectDefinitionCreateInput!
      ) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition {
            id
            type
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    variables: {
      "definition": {
        "name": "Upfile Shop Settings",
        "type": "upfile-shop-settings",
        "access": {
          "storefront": "PUBLIC_READ"
        },
        "fieldDefinitions": [
          {
            "name": "Upfile Widgets",
            "key": "upfile-widgets",
            "type": "list.metaobject_reference",
            "validations": [
              {
                "name": "metaobject_definition_id",
                "value": `${widgetId}`
              }
            ]
          },
          {
            "name": "Metaobject Definition Index",
            "key": "metaobject-definition-index",
            "type": "json"
          },
          {
            "name": "Setup Guide Progress",
            "key": "setup-guide-progress",
            "type": "json"
          },
          {
            "name": "Max File Size",
            "key": "max-file-size",
            "type": "number_integer"
          },
          {
            "name": "Max Request Size",
            "key": "max-request-size",
            "type": "number_integer"
          },
          {
            "name": "Upfile Subscription Plan",
            "key": "upfile-subscription-plan",
            "type": "single_line_text_field"
          },
          {
            "name": "App Bridge Enabled",
            "key": "app-bridge-enabled",
            "type": "boolean"
          },
          {
            "name": "Theme Block Enabled",
            "key": "theme-block-enabled",
            "type": "boolean"
          },
          {
            "name": "Init Upfile Metafields Defined",
            "key": "init-upfile-metafields-defined",
            "type": "boolean"
          },
          {
            "name": "Forbidden File Types",
            "key": "forbidden-file-types",
            "type": "list.single_line_text_field"
          },
          {
            "name": "Known Cart Drawer Selectors",
            "key": "known-cart-drawer-selectors",
            "type": "list.single_line_text_field"
          },
          {
            "name": "Known Cart Drawer Footer Selectors",
            "key": "known-cart-drawer-footer-selectors",
            "type": "list.single_line_text_field"
          }
        ]
      }
    }
  };
};

export const defineAppDataObj = (widgetId: string): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      mutation CreateAppDataMetafield(
        $metafieldsSetInput: [MetafieldsSetInput!]!
      ) {
        metafieldsSet(metafields: $metafieldsSetInput) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      "metafieldsSetInput": [
        {
          "namespace": "secret_keys",
          "key": "api_key",
          "type": "single_line_text_field",
          "value": "aS1hbS1hLXNlY3JldC1hcGkta2V5Cg==",
          "ownerId": "gid://shopify/AppInstallation/3"
        }
      ]
    }
  };
};

/**
 *@GET DATA
 */
// I believe this would DIFFER per install?
// "gid://shopify/AppInstallation/561175429305"
export const getCurrentAppInstallId: GQL_BODY = {
  query: /* GraphQL */ `
    query {
      currentAppInstallation {
        id
      }
    }
  `,
  variables: {}
};

export const getDefinitionByType = (type: string): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      query GetDefinitionByType($type: String!) {
        metaobjectDefinitionByType(type: $type) {
          id
          name
          type
          access {
            admin
            storefront
          }
          createdByApp {
            developerName
          }
          fieldDefinitions {
            key
            name
            required
          }
        }
      }
    `,
    variables: {
      "type": `${type}`
    }
  };
};

export const readDataDefinitions: GQL_BODY = {
  query: /* GraphQL */ `
    {
      metaobjectDefinitions(first: 50) {
        nodes {
          id
          name
          type
        }
      }
    }
  `,
  variables: {}
};

// MetaObjects
export const getAppMetaobjects: GQL_BODY = {
  query: /* GraphQL */ `
    query GetAppMetaobjects($type: String!) {
      metaobjects(first: 100, type: $type) {
        nodes {
          id
          handle
          type
          fields {
            key
            value
          }
        }
      }
    }
  `,
  variables: {
    "type": "app--195415539713--upfile-shop-settings"
  }
};

/* This is the data to store on OUR DB that we get from Shopify: */
export const getMerchantShopifyData: GQL_BODY = {
  query: /* GraphQL */ `
    query getApp($key: String!) {
      appByKey(apiKey: $key) {
        previouslyInstalled
        handle
        id
        pricingDetailsSummary
      }
      shop {
        id
        name
        description
        url
        myshopifyDomain
        email
        timezoneAbbreviation
        shipsToCountries
        shopOwnerName
        createdAt
        resourceLimits {
          locationLimit
          maxProductOptions
          maxProductVariants
          redirectLimitReached
        }
        plan {
          partnerDevelopment
          shopifyPlus
        }
        contactEmail
        billingAddress {
          id
          address1
          address2
          city
          company
          country
          countryCodeV2
        }
      }
    }
  `,
  variables: {
    "key": "1326da75f35080a5aa9440f98a4fb7cd"
  }
};

/**
 *@ADD METAOBJECT INSTANCES
 */

/*
  
  "Upfile Injection Settings": "gid://shopify/MetaobjectDefinition/8187019449",
  "Upfile Block Settings": "gid://shopify/MetaobjectDefinition/8187052217",
   "Upfile Widget Data": "gid://shopify/MetaobjectDefinition/8356200633",
   "Upfile Shop Settings": "gid://shopify/MetaobjectDefinition/8356364473"
  

  app--2315872--upfile-shop-settings
 */
export const initCreateStoreData = (
  injectionDef: MetaobjectDefinitionInfo,
  blockDef: MetaobjectDefinitionInfo,
  widgetDef: MetaobjectDefinitionInfo,
  shopDef: MetaobjectDefinitionInfo
): GQL_BODY => {
  console.log("injectionDef:", injectionDef);
  console.log("blockDef:", blockDef);
  console.log("widgetDef:", widgetDef);
  console.log("shopDef:", shopDef);

  return {
    query: /* GraphQL */ `
      mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    "variables": {
      "metaobject": {
        "type": `${shopDef.type}`,
        "handle": "upfile-shop-settings-init",
        "fields": [
          {
            "key": "metaobject-definition-index",
            "value": JSON.stringify({
              "Upfile Injection Settings": `${injectionDef.id}`,
              "Upfile Block Settings": `${blockDef.id}`,
              "Upfile Widget Data": `${widgetDef.id}`,
              "Upfile Shop Settings": `${shopDef.id}`
            })
          },
          {
            "key": "setup-guide-progress",
            "value": JSON.stringify({
              "appBridgeActive": "false",
              "locationSelected": "false",
              "planSelected": "false",
              "setupComplete": "false"
            })
          },
          { "key": "max-file-size", "value": "20000000" },
          { "key": "max-request-size", "value": "20000000" },
          { "key": "init-upfile-metafields-defined", "value": "true" },
          {
            "key": "forbidden-file-types",
            "value": [".js", ".exe", ".bat", ".sh", ".php", ".html", ".bin"]
          },
          {
            "key": "known-cart-drawer-selectors",
            "value": [
              ".cart-drawer",
              "#CartDrawer",
              "#cart-drawer",
              ".mini-cart",
              ".drawer--cart"
            ]
          },
          {
            "key": "known-cart-drawer-footer-selectors",
            "value": [
              ".cart__footer",
              ".cart-footer",
              ".drawer__footer",
              ".cart-drawer__footer"
            ]
          }
        ]
      }
    }
  };
};

/**
 *@UPCART METAOBJECTS INSTANCES:
 */

// ... add here

/**
 *@UPCART DELETE:
 */

export const deleteStoreDataDefinition = (id: string): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      mutation DeleteMetaobjectDefinition($id: ID!) {
        metaobjectDefinitionDelete(id: $id) {
          deletedId
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      "id": "gid://shopify/MetaobjectDefinition/7968620742"
    }
  };
};
