import { Card, Page, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData } from "@remix-run/react";
import ProductTable from "../components/ProductTable/ProductTable";
import { authenticate, apiVersion } from "app/shopify.server";
import { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { GraphqlQueryError } from "@shopify/shopify-api";
// mutations, side effects, form submissions
export async function action({ req, res }: { req: Request; res: Response }) {
  // ! 1) get the products via Admin API

  // ! 2) Load them into the IndexTable

  return null;
}

/*
mutation updateOrderMetafields($input: OrderInput!) {
  orderUpdate(input: $input) {
    order {
      id
      metafield (namespace: "custom", key: "order_image") {
        id
      }
    
      }
    }
  }  
 
*/

const query = `{
products (first: 20) {
    edges {
      node {
        id
        title
        status
        metafield ( namespace: "custom", key:"dropzone_component_enabled") {
          value
        }
        media(first: 1) {
          edges {
            node {
              ... on MediaImage {
                image {
                  url
                  }
                }
              }
            }
          }
        }
      }
    }
  
}`;

// get requests, load data
export async function loader({ request }: ActionFunctionArgs) {
  // how can we perform pagination here?
  // click on new page makes another loader call??

  // ! Get products so the user can SIFT through and select
  const { admin, session } = await authenticate.admin(request);
  const { shop, accessToken } = session;
  console.log("shop:", shop);
  console.log("accessToken:", accessToken);

  console.log("****** admin:", admin);

  try {
    if (!accessToken) return;

    const response = await fetch(
      `https://${shop}/admin/api/${apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/graphql",
          "X-Shopify-Access-Token": accessToken,
        },
        body: query,
      },
    );

    if (response.ok) {
      const data = await response.json();

      const flattenProductData = (data) => {
        return data.products.edges.map(({ node }) => {
          const mediaNode = node.media.edges[0]?.node;
          const image = mediaNode?.image || {};
          return {
            id: node.id || null,
            title: node.title || null,
            status: node.status || null,
            dropzoneEnabled: node.metafield
              ? node.metafield.value === "true"
                ? true
                : false
              : false,
            url: image.url || null,
          };
        });
      };

      // Example usage:
      const flattenedData = flattenProductData(data.data);

      return flattenedData;
    }

    return null;
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
          <TitleBar title="UpFile - Products List"></TitleBar>
          <Card>
            A list of all products that have an upfile block enabled on their
            PDP. To configure this, go to Widgets. - Could use this to show the
            sales data?
          </Card>
        </Layout.Section>
        <Layout.Section>
          <ProductTable data={data} />
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
