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

// devId = gid://shopify/MetaobjectDefinition/7877034169
// devType = app--195415539713--upfile-shop-settings
export const defineUpfileStoreData = (): GQL_BODY => {
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
        "name": "Permitted File Types",
        "type": "$app:upfile-shop-settings",
        "access": {
          "storefront": "PUBLIC_READ"
        },
        "fieldDefinitions": [
          {
            "name": "maxFileSize",
            "key": "max-file-size",
            "type": "number_integer"
          },
          {
            "name": "maxRequestSize",
            "key": "max-request-size",
            "type": "number_integer"
          },
          {
            "name": "subscriptionPlan",
            "key": "subscription-plan-name",
            "type": "single_line_text_field"
          },
          {
            "name": "themeBlockEnabled",
            "key": "theme-block-enabled",
            "type": "boolean"
          },
          {
            "name": "forbiddenFileType",
            "key": "forbidden-file-types",
            "type": "json"
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
