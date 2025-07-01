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

export const defineShopSettings = (): GQL_BODY => {
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
        "value": "$app:upfile-shop-settings",
        "access": {
          "storefront": "PUBLIC_READ"
        },
        "fieldDefinitions": [
          {
            "name": "Theme Block Widgets",
            "key": "theme-block-widgets",
            "type": "list.metaobject_reference",
            "validations": [
              {
                "name": "type",
                "value": "$app:upfile-widget-settings"
              }
            ]
          },
          {
            "name": "Injected Widgets",
            "key": "injected-widgets",
            "type": "list.metaobject_reference",
            "validations": [
              {
                "name": "type",
                "value": "$app:upfile-widget-settings"
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

// devId = gid://shopify/MetaobjectDefinition/7877034169
// devType = app--195415539713--upfile-shop-settings
export const defineWidgetSettings = (): GQL_BODY => {
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
        "name": "Widget Data",
        "value": "$app:upfile-widget-settings",
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
                "name": "type",
                "value": "$app:upfile-block-settings"
              }
            ]
          },
          {
            "name": "Injection Settings",
            "key": "injection-settings",
            "type": "metaobject_reference",
            "validations": [
              {
                "name": "type",
                "value": "$app:upfile-injection-settings"
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

export const defineInjectionSettings = (): GQL_BODY => {
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
        "name": " Data",
        "value": "$app:upfile-injection-settings",
        "access": {
          "storefront": "PUBLIC_READ"
        },
        "fieldDefinitions": [
          {
            "name": "Widget Name",
            "key": "widget-name",
            "type": "single_line_text_field"
          }
        ]
      }
    }
  };
};

export const defineBlockWidgetSettings = (): GQL_BODY => {
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
        "name": "Widget Data",
        "value": "$app:upfile-block-settings",
        "access": {
          "storefront": "PUBLIC_READ"
        },
        "fieldDefinitions": [
          {
            "name": "Widget Name",
            "key": "widget-name",
            "type": "single_line_text_field"
          }
        ]
      }
    }
  };
};

export const readStoreDataDefinitions: GQL_BODY = {
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

export const deleteStoreDataDefinition = (): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      mutation DeleteMetaobjectDefinition($id: ID!) {
        metaobjectDefinitionDelete(id: $id) {
          deletedId
        }
      }
    `,
    "variables": {
      "id": "gid://shopify/MetaobjectDefinition/7968620742"
    }
  };
};

// TODO: starting to add some mock data to the metaobject definition:
export const addUpfileStoreData: GQL_BODY = {
  query: /* GraphQL */ ``,
  variables: {}
};
