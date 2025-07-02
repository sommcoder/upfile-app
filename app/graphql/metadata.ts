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

export const getMerchantAppData: GQL_BODY = {
  query: /* GraphQL */ `
    query getApp($key: String!) {
      appByKey(apiKey: $key) {
        previouslyInstalled
        handle
        id
        pricingDetailsSummary
      }
      shop {
        name
        description
        url
        myshopifyDomain
        email
        timezoneAbbreviation
        shipsToCountries
        id
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

// Metafield/object Definitions:

// pass the gid as the reference to the parent objects

/*
 "metaobjectDefinition": {
        "id": "gid://shopify/MetaobjectDefinition/8070955193",
        "name": "Upfile Injection Settings",
        "type": "app--2315872--upfile-injection-settings"
      },
 
*/
export const defineInjectionSettings = (): GQL_BODY => {
  return {
    defType: "$app:upfile-injection-settings",
    query: /* GraphQL */ `
      mutation CreateMetaobjectDefinition(
        $definition: MetaobjectDefinitionCreateInput!
      ) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition {
            id
            name
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
        "type": "$app:upfile-injection-settings",
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
 
    "metaobjectDefinition": {
        "id": "gid://shopify/MetaobjectDefinition/8070201529",
        "name": "Upfile Block Settings",
        "type": "app--2315872--upfile-block-settings"
}
*/
export const defineBlockSettings = (): GQL_BODY => {
  return {
    defType: "$app:upfile-block-settings",
    query: /* GraphQL */ `
      mutation CreateMetaobjectDefinition(
        $definition: MetaobjectDefinitionCreateInput!
      ) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition {
            id
            name
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
        "type": "$app:upfile-block-settings",
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
 
 "metaobjectDefinition": {
        "id": "gid://shopify/MetaobjectDefinition/8071348409",
        "name": "Widget Data",
        "type": "app--2315872--upfile-widget-settings"
      },
 
*/
export const defineWidgetSettings = (
  injectDefId: string,
  blockDefId: string
): GQL_BODY => {
  // pass in the gid's from the return of defineBlockSettings() and defineInjectionSettings()

  return {
    defType: "$app:upfile-widget-settings",
    query: /* GraphQL */ `
      mutation CreateMetaobjectDefinition(
        $definition: MetaobjectDefinitionCreateInput!
      ) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition {
            id
            name
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
        "name": "Widget Data",
        "type": "$app:upfile-widget-settings",
        "access": {
          "storefront": "PUBLIC_READ"
        },
        "fieldDefinitions": [
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

// $app:upfile-shop-settings
export const defineShopSettings = (widgetId: string): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      mutation CreateMetaobjectDefinition(
        $definition: MetaobjectDefinitionCreateInput!
      ) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition {
            id
            name
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
        "type": "$app:upfile-shop-settings",
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
            "name": "Subscription Plan",
            "key": "subscription-plan",
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
          }
        ]
      }
    }
  };
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
  `
};

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
//7582843065
// "gid://shopify/MetaobjectDefinition/8056635577"
// "gid://shopify/MetaobjectDefinition/7877034169"

// TODO: starting to add some mock data to the metaobject definition:
export const addUpfileStoreData: GQL_BODY = {
  query: /* GraphQL */ ``,
  variables: {}
};

/*
 
         "id": "gid://shopify/MetaobjectDefinition/8070201529",
          "name": "Upfile Block Settings",
          "type": "app--2315872--upfile-block-settings"
        },
        {
          "id": "gid://shopify/MetaobjectDefinition/8070955193",
          "name": "Upfile Injection Settings",
          "type": "app--2315872--upfile-injection-settings"
        },
        {
          "id": "gid://shopify/MetaobjectDefinition/8071348409",
          "name": "Widget Data",
          "type": "app--2315872--upfile-widget-settings"
 
*/
