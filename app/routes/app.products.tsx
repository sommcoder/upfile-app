import {
  Card,
  Text,
  useBreakpoints,
  IndexTable,
  useIndexResourceState,
  Page,
  Layout,
  Badge,
} from "@shopify/polaris";
import type { IndexTableProps, IndexTableRowProps } from "@shopify/polaris";

import { TitleBar } from "@shopify/app-bridge-react";
import React from "react";
import { useLoaderData } from "@remix-run/react";
import ProductTable from "./products/ProductTable";


// mutations, side effects, form submissions
export async function action({ req, res }: { req: Request; res: Response }) {
  // ! 1) get the products via Admin API

  // ! 2) Load them into the IndexTable

  return null;
}

// get requests, load data
export async function loader() {
/*
 
! GraphQL HTTP status codes are different from REST API status codes. Most importantly, the GraphQL API can return a 200 OK response code in cases that would typically produce 4xx or 5xx errors in REST.
 
*/

// how can we perform pagination here?
// click on new page makes another loader call?? 

const queryString = `#graphql{
query CustomCollectionList {
  collections(first: 10, query: "collection_type:custom") {
    nodes {
      id
      handle
      title
    }
   }
  }
}`

// `session` is built as part of the OAuth process
const client = new shopify.clients.Graphql({session});
const products = await client.query({
  data: queryString,
});



}


  return null;
}

export default function ProductsPage() {
  const data = useLoaderData();
  console.log("data:", data);

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
            their PDP
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
