# PrettierRC is set to preserve JSON syntax in this folder

- no trailing commas
- preserves double quotes on keys
- this enables us to be able to copy and paste easily into the GraphiQL App or Postman for testing as they require JSON syntax for variables.
- With this format we can keep variables and query/mutations in the same object, export them to the correct files while preserving the ability to quickly use them in the services mentioned above

## We can ALSO use this setup in the Remix app as well and therefore this format can be shared globally:

```javascript
export const getAppMetaobjects: GQL_INPUT = {
query: `query GetAppMetaobjects($type: String!) {
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
```

^^ This, can be used in this function like so:

```javascript
admin.graphql(getAppMetaobjects.query,
{ getAppMetaobjects.variables });
```

This way we can maintain the same query format throughout the code base, it's graphql and Postman-friendly AND we can also use the format in our Remix app using the admin and storefront object that are returned from authenticate.admin/storefront

# GQL_INPUT type

The GQL_INPUT type is always query, despite the obvious distinction between queries and mutations in graphql. This is just the key that's needed for the request body of the fetch call

# Naming Conventions:

All call should start with:

create
read
update
delete
define

define is different than create in that is performed before any create mutations
