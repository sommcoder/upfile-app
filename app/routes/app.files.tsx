import { json } from "@remix-run/node";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  Badge,
  Card,
  IndexTable,
  Layout,
  Page,
  Text,
  useIndexResourceState,
} from "@shopify/polaris";
import { authenticate } from "app/shopify.server";

export async function action({ req, res }: { req: Request; res: Response }) {
  const { cors, admin } = await authenticate.admin(req);
  //   console.log("cors:", cors);

  //   // we should handle our CORS requests here. This is receiving the file request from our theme app block

  //   const gqlResponse = await admin.graphql(`#graphql
  //   orders {

  //         }
  // `);

  //   if (!gqlResponse) return null;

  //   const parsedRes = await gqlResponse.json();

  //   return cors(json({ data: parsedRes.data }));

  return null;
}

export async function loader() {
  const data = { message: "Hello from the loader!" };
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export default function FilesPage() {
  const orders = [
    {
      id: "1020",
      order: "#1020",
      date: "Jul 20 at 4:34pm",
      customer: "Jaydon Stanton",
      total: "$969.44",
      paymentStatus: <Badge progress="complete">Paid</Badge>,
      fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
    },
    {
      id: "1019",
      order: "#1019",
      date: "Jul 20 at 3:46pm",
      customer: "Ruben Westerfelt",
      total: "$701.19",
      paymentStatus: <Badge progress="partiallyComplete">Partially paid</Badge>,
      fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
    },
    {
      id: "1018",
      order: "#1018",
      date: "Jul 20 at 3.44pm",
      customer: "Leo Carder",
      total: "$798.24",
      paymentStatus: <Badge progress="complete">Paid</Badge>,
      fulfillmentStatus: <Badge progress="incomplete">Unfulfilled</Badge>,
    },
  ];
  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders);

  const rowMarkup = orders.map(
    (
      { id, order, date, customer, total, paymentStatus, fulfillmentStatus },
      index,
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {order}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{date}</IndexTable.Cell>
        <IndexTable.Cell>{customer}</IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" alignment="end" numeric>
            {total}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{paymentStatus}</IndexTable.Cell>
        <IndexTable.Cell>{fulfillmentStatus}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page>
      <TitleBar title="Uploaded Files List" />
      <Layout>
        <Layout.Section>
          <Card>Collection of all of the files submitted.</Card>
          <IndexTable
            resourceName={resourceName}
            itemCount={orders.length}
            selectedItemsCount={
              allResourcesSelected ? "All" : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: "Order" },
              { title: "Date" },
              { title: "Customer" },
              { title: "Total", alignment: "end" },
              { title: "Payment status" },
              { title: "Fulfillment status" },
            ]}
          >
            {rowMarkup}
          </IndexTable>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
