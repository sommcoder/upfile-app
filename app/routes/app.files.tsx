import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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

/* 
json:
@deprecated
This utility is deprecated in favor of opting into Single Fetch via future.v3_singleFetch and returning raw objects. This method will be removed in React Router v7. If you need to return a JSON res, you can use res.json().
*/

// How do we do server routing and expose endpoints with Remix?

/* 
- I understand that the file name dictates the endpoint.. like this one should be something like: host.com/submit



TODO: Update your App URL and Allowed redirection URL(s) in the Shopify Partner Dashboard to include the endpoint.

*/
export async function action({ req, res }: { req: Request; res: Response }) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  console.log("/submit, req.body:", req.body);

  const formData = await req.formData();
  const userInput = formData.get("userInput");

  if (!userInput) {
    return json({ error: "Input is required" }, { status: 400 });
  }

  console.log("User Input:", userInput);

  // Process the input (e.g., save to database or send to another API)
  return json({ success: true, message: "Submission received" });
}

export async function loader() {
  const data = { message: "Hello from the loader!" };
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export default function MyComponent() {
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
      <TitleBar title="Uploaded Files" />
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
