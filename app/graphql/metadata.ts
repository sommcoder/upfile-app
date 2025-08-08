/**
 *@CREATE DATA DEFINITIONS
 */

import {
  convertKeysToKebabCase,
  formatMetaobjectFields
} from "app/helper/dataFormatting";

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
        // Adjusted Data to Settings FYI
        "name": "Upfile Widget Settings",
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
          },

          {
            "name": "Product List",
            "key": "product-id-list",
            "type": "list.single_line_text_field"
          },
          {
            "name": "Collection List",
            "key": "collection-id-list",
            "type": "single_line_text_field"
          },
          {
            "name": "Theme Activation Type",
            "key": "theme-activation-type",
            "type": "single_line_text_field"
          },
          {
            "name": "Valid Theme List",
            "key": "valid-theme-list",
            "type": "list.single_line_text_field"
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

/*
 

          "id": "gid://shopify/MetaobjectDefinition/8951595193",
       
 
*/

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
          type
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

//
// "gid://shopify/Metaobject/114987040953"

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
    "type": "upfile-shop-settings"
  }
};

/* This is the data to store on OUR DB that we get from Shopify: */
export const getMerchantShopifyData = (apiKey: string): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      query getApp($apiKey: String!) {
        appByKey(apiKey: $apiKey) {
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
      "key": `${apiKey}`
    }
  };
};

/**
 *@CREATE METAOBJECT INSTANCES
 */

export const initCreateStoreData = (
  injectionDef: MetaobjectDefinitionInfo,
  blockDef: MetaobjectDefinitionInfo,
  widgetDef: MetaobjectDefinitionInfo,
  shopDef: MetaobjectDefinitionInfo
): GQL_BODY => {
  const variablePayload = {
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
            "upfile-app-bridge-embed": false,
            "upfile-theme-block": false,
            "location-selected": false,
            "plan-selected": false,
            "init-setup-complete": false
          })
        },
        { "key": "max-file-size", "value": "20000000" },
        { "key": "max-request-size", "value": "20000000" },
        { "key": "init-upfile-metafields-defined", "value": "true" },
        {
          "key": "forbidden-file-types",
          "value": JSON.stringify([
            ".js",
            ".exe",
            ".bat",
            ".sh",
            ".php",
            ".html",
            ".bin"
          ])
        },
        {
          "key": "known-cart-drawer-selectors",
          "value": JSON.stringify([
            ".cart-drawer",
            "#CartDrawer",
            "#cart-drawer",
            ".mini-cart",
            ".drawer--cart"
          ])
        },
        {
          "key": "known-cart-drawer-footer-selectors",
          "value": JSON.stringify([
            ".cart__footer",
            ".cart-footer",
            ".drawer__footer",
            ".cart-drawer__footer"
          ])
        }
      ]
    }
  };

  console.log("UPFILE variablePayload:", variablePayload);

  return {
    query: /* GraphQL */ `
      mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject {
            id
            type
            fields {
              key
              value
              jsonValue
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    variables: variablePayload
  };
};

export const createWidget = (userInput, widgetDef): GQL_BODY => {
  const kebabData = convertKeysToKebabCase(userInput);
  console.log("kebabData:", kebabData);
  const formattedFields = formatMetaobjectFields(kebabData);

  const payload = {
    "metaobject": {
      "type": `${widgetDef.type}`,
      "fields": formattedFields
    }
  };
  //     fields: [
  //       { key: "widget-name", value: "Test Widget" },
  //       { key: "widget-type", value: "block" },
  //       { key: "max-file-size", value: "5242880" }, // 5MB in bytes
  //       { key: "multi-file-submission-enabled", value: "true" },
  //       { key: "shadow-root-enabled", value: "true" },
  //       { key: "max-file-count", value: "3" },

  //       {
  //         key: "block-settings",
  //         reference: {
  //           id: `${blockDef ? blockDef.id : ""}`
  //         }
  //       },
  //       {
  //         key: "injection-settings",
  //         reference: {
  //           id: `${injectionDef ? injectionDef.id : ""}`
  //         }
  //       },

  //       {
  //         key: "custom-html",
  //         value: "<div>Test HTML</div>"
  //       },
  //       {
  //         key: "custom-js",
  //         value: "console.log('hi');"
  //       },
  //       {
  //         key: "custom-css",
  //         value: ".upload { color: red; }"
  //       },
  //       {
  //         key: "product-id-list",
  //         value: JSON.stringify([
  //           "gid://shopify/Product/123",
  //           "gid://shopify/Product/456"
  //         ])
  //       },
  //       {
  //         key: "collection-id-list",
  //         value: JSON.stringify(["gid://shopify/Collection/789"])
  //       },
  //       {
  //         key: "theme-activation-type",
  //         value: "main-only"
  //       },
  //       {
  //         key: "valid-theme-list",
  //         value: JSON.stringify(["Dawn", "Craft"])
  //       }
  //     ]
  //   }
  // };

  console.log("UPFILE payload:", payload);

  return {
    query: /* GraphQL */ `
      mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject {
            id
            type
            fields {
              key
              value
              jsonValue
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    variables: payload
  };
};

/**
 *@UpFile DELETE:
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

export const deleteWidgetInstance = (id: string): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      mutation DeleteMetaobject($id: ID!) {
        metaobjectDelete(id: $id) {
          deletedId
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    variables: {
      "id": `${id}`
    }
  };
};

/**
 * @UPDATE
 */

// mutation UpdateSetupGuideProgress($metaobjectId: ID!, $metaobject: MetaobjectUpdateInput!) {
//   metaobjectUpdate(id: $metaobjectId, metaobject: $metaobject) {
//     metaobject {
//       id
//       fields {
//         key
//         value
//       }
//     }
//     userErrors {
//       field
//       message
//     }
//   }
// }
