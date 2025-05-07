import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
  return new Response("Method not allowed", { status: 405 });
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const { session, storefront } = await authenticate.public.appProxy(request);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Handle different cart operations based on the request
    if (request.method === "POST") {
      const { operation, input } = await request.json();

      switch (operation) {
        case "getCart": {
          const query = `
            query {
              cart {
                id
                lines(first: 10) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                          price {
                            amount
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `;
          const response = await storefront.graphql(query);
          return new Response(JSON.stringify(response), {
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
                  lines(first: 10) {
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
                  lines(first: 10) {
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
