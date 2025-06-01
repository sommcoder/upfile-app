// all of the gql calls needed when the merchant installs the app:

export const getMerchantAppData = {
  query: `#graphql
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
    key: "1326da75f35080a5aa9440f98a4fb7cd",
  },
};

export const defineUpfileStoreData: {
  gql: string;
  variables: any;
} = {
  gql: `#graphql
  mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
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
  }`,
  variables: {
    definition: {
      name: "Permitted File Types",
      type: "$app:upfile",
      access: {
        storefront: "PUBLIC_READ",
      },
      fieldDefinitions: [
        {
          name: "MIME Type",
          key: "mime-type",
          type: "single_line_text_field",
        },
      ],
    },
  },
};

export const getStoreDataDefinitions = {
  query: `#graphql
{
metaobjectDefinitions(first:50) {
  nodes {
    id
    name
  }
}
}
`,
};

export const removeStoreDataDefinition = {
  mutation: `#graphql
  mutation DeleteMetaobjectDefinition($id: ID!) {
  metaobjectDefinitionDelete(id: $id) {
    deletedId
  }
}`,
  variables: {
    id: "gid://shopify/MetaobjectDefinition/7968620742",
  },
};

export const addUpfileStoreData = {
  mutation: ``,
  variables: {},
};

export const newQuery = {
  mutation: `#graphql
  query GetMyAppMetaobjects($type: String!) {
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
}`,
  variables: {
    type: "upfile",
  },
};
