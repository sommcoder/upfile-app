// MetaObjects
export const getAppMetaobjects: GQL_INPUT = {
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
    "type": "$app:upfile"
  }
};

export const getMerchantAppData: GQL_INPUT = {
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

export const defineUpfileStoreData: GQL_INPUT = {
  query: /* GraphQL */ `
    mutation CreateMetaobjectDefinition(
      $definition: MetaobjectDefinitionCreateInput!
    ) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition {
          name
          type
          fieldDefinitions {
            name
            key
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
  variables: {
    "definition": {
      "name": "Permitted File Types",
      "type": "$app:upfile",
      "access": {
        "storefront": "PUBLIC_READ"
      },
      "fieldDefinitions": [
        {
          "name": "MIME Type",
          "key": "mime-type",
          "type": "single_line_text_field"
        }
      ]
    }
  }
};

export const readStoreDataDefinitions: GQL_INPUT = {
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

export const deleteStoreDataDefinition: GQL_INPUT = {
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

//
export const addUpfileStoreData: GQL_INPUT = {
  query: /* GraphQL */ ``,
  variables: {}
};
