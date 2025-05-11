import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { authenticate, unauthenticated } from "app/shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const { session, storefront } = await authenticate.public.appProxy(request);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (request.method === "POST") {
      const { operation, query, variables } = await request.json();

      switch (operation) {
        case "getCart": {
          console.log("id:", id);
          if (!id) {
            return new Response("Missing cartId", { status: 400 });
          }

       
          if (!session) {
            return new Response("Unauthorized", { status: 401 });
          }

          console.log("storefront:", storefront);

          if (!storefront) {
            return new Response();
          }

          const response = await storefront.graphql(
            ` query GetProduct($handle: String!) {
                productByHandle(handle: $handle) {
                    id
                    title
                  }
                }`,
            {
              variables: {
                cartId: "the-collection-snowboard-hydrogen",
              },
            },
          );

          const body = await response.json();
          console.log("GraphQL body:", body);

          if (!body) {
            console.error("Invalid GraphQL body:", body);
            return new Response("Invalid response from Shopify", {
              status: 500,
            });
          }

          return new Response(JSON.stringify(body), {
            headers: { "Content-Type": "application/json" },
            status: 200,
          });
        }

        case "addToCart": {
          const mutation = `
            mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
              cartLinesAdd(cartId: $cartId, lines: $lines) {
                cart {
                  id
                  lines(first: 50) {
                    edges {
                      node {
                        id
                        quantity
                      }
                    }
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `;
          const response = await storefront.graphql(mutation, input);
          return new Response(JSON.stringify(response), {
            headers: { "Content-Type": "application/json" },
            status: 200,
          });
        }

        case "updateCart": {
          const mutation = `
            mutation updateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
              cartLinesUpdate(cartId: $cartId, lines: $lines) {
                cart {
                  id
                  lines(first: 50) {
                    edges {
                      node {
                        id
                        quantity
                      }
                    }
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `;
          const response = await storefront.graphql(mutation, input);
          return new Response(JSON.stringify(response), {
            headers: { "Content-Type": "application/json" },
            status: 200,
          });
        }

        default:
          return new Response("Invalid operation", { status: 400 });
      }
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("Cart API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
