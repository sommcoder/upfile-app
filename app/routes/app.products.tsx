import { Card, Page, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData } from "@remix-run/react";
import ProductTable from "./products/ProductTable";
import { authenticate } from "app/shopify.server";
import { LoaderFunction } from "@remix-run/node";

// mutations, side effects, form submissions
export async function action({ req, res }: { req: Request; res: Response }) {
  // ! 1) get the products via Admin API

  // ! 2) Load them into the IndexTable

  return null;
}

// get requests, load data
export async function loader({
  req,
  res,
}: {
  req: Request;
  res: Response | undefined;
}) {
  /*
 
! GraphQL HTTP status codes are different from REST API status codes. Most importantly, the GraphQL API can return a 200 OK response code in cases that would typically produce 4xx or 5xx errors in REST.
 


If there's a session for this user, then this loader will return null. If there's no session for the user, then the loader will throw the appropriate redirect Response.

Anchor to section titled 'Authenticating cross-origin admin requests'
Authenticating cross-origin admin requests
If your Remix server is authenticating an admin extension, then a request from the extension to Remix will be cross-origin.


extension requests are cross-origin because they come from the client's browser
for extension requests:

  const { cors } = await shopify.authenticate.admin(req);

  // App logic

  return cors(res.json({ my: "data" }));

  admin.graphql(
      `#graphql
      mutation updateProductTitle($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
          }
        }
      }`,
      {
        variables: {
          input: {id: '123', title: 'New title'},
        },
      },
    );

*/

  // how can we perform pagination here?
  // click on new page makes another loader call??

  // ! Get products so the user can SIFT through and select
  try {
    // if (!res) throw new Error();
    const { admin } = await authenticate.admin(req);
    console.log("****** admin:", admin);

    const query = `
    {
      products (first: 20) { 
          edges {
            node {
            id
            title
          }
        } 
      }
    }
    `;

    const gqlResponse = admin.graphql(query);
    console.log("gqlResponse:", gqlResponse);

    if (!gqlResponse) return null;

    if (!res) throw new Error();

    const parsedResponse = await res.json(gqlResponse); // we have to wait for the parsing

    console.log("parsedResponse]:", parsedResponse);

    return { data: parsedResponse.data };
  } catch (error) {
    if (error instanceof Error) {
      console.log("products loader() msg:", error.message);
    } else {
      console.log("products loader() error:", error);
    }
    console.log("error!");
    // ! Remix: need to AT LEAST return null if loader fails
    return null;
  }
}

export default function ProductsPage() {
  const data = useLoaderData<typeof loader>();
  console.log("data:", data); // THIS should be the products now!

  /*
   
  1) create an EmptyState component here if there are no products that are assigned to have a dropzone (metafield?)
   
  */
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <TitleBar title="Products List"></TitleBar>
          <Card>
            A list of all products that have a DropZone component enabled on
            their PD
          </Card>
        </Layout.Section>
        <Layout.Section>
          <ProductTable />
        </Layout.Section>
        <Layout.Section>
          <Card>
            A list of ALL products <br />- we need to have the option to get
            products by collection, all products, or tags <br />- may also be
            great to allow the merchant to enable an automatic generator here..
            much like with collections where products with a tarticular tag will
            be added to a collection, having them be auto-enabled with the
            dropzone widget could be a nice convenience for merchants
          </Card>
        </Layout.Section>
        <Layout.Section></Layout.Section>
      </Layout>
    </Page>
  );
}
