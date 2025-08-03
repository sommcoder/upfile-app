export const getStoreMainTheme = (): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      {
        themes(first: 1, roles: [MAIN]) {
          nodes {
            id
            name
            role
            themeStoreId
          }
        }
      }
    `,
    variables: {}
  };
};

// gid://shopify/OnlineStoreTheme/144547250361
/*
 
{
  "current": {
    "enabled": {
      "apps": {
        "your-app-id": true
      }
    }
  }
}
 
*/
export const getFileSettingsContent = (
  themeId: string,
  filename: string
): GQL_BODY => {
  return {
    query: /* GraphQL */ `
      query SettingsData($themeId: ID!, $filename: String!) {
        theme(id: $themeId) {
          files(filenames: [$filename]) {
            nodes {
              body {
                ... on OnlineStoreThemeFileBodyText {
                  content
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      "themeId": `${themeId}`,
      "filename": `${filename}`
    }
  };
};
