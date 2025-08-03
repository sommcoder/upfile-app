// eslint-disable-next-line
const GetThemes: GQL_BODY = {
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
  variables: {
    count: 20
  }
};

const getFileSettingsContent: GQL_BODY = {
  query: /* GraphQL */ `
    query SettingsData($themeId: ID!, $filename: String!) {
      theme(id: $themeId) {
        files(filenames: [$filename]) {
          nodes {
            body {
              __typename
            }
          }
        }
      }
    }
  `
};
