export const getStoreThemeList = (count: number): GQL_BODY => {
  const jsonString = JSON.stringify({ "count": `${count || 20}` }, null, 2);

  console.log("jsonString:", jsonString);

  return {
    query: /* GraphQL */ `
      query GetThemes($count: Int!) {
        themes(first: $count) {
          nodes {
            id
            name
            role
            themeStoreId
          }
        }
      }
    `,
    variables: { "count": count }
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
export const getSettingsData = (
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
