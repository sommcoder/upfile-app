const gql = {
  query: /* GraphQL */ `
    mutation UpdateSetupGuideProgress(
      $metaobjectId: ID!
      $metaobject: MetaobjectUpdateInput!
    ) {
      metaobjectUpdate(id: $metaobjectId, metaobject: $metaobject) {
        metaobject {
          id
          fields {
            key
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
  variables: {
    "metaobjectId": "gid://shopify/Metaobject/114987040953",
    "metaobject": {
      "fields": {
        "key": "setup-guide-progress",
        "value":
          '{"upfile-app-bridge-embed":false,"upfile-theme-block":false,"location-selected":false,"plan-selected":false,"init-setup-complete":false}'
      }
    }
  }
};
