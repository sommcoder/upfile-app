// This may not be needed in a Remix template:
export const getCurrAppInstallation: GQL_BODY = {
  query: /* GraphQL */ `
    query {
      currentAppInstallation {
        id
      }
    }
  `
};
