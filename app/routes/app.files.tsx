import { useLoaderData } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IndexTable,
  Layout,
  Page,
  ProgressBar,
  Text,
  useIndexResourceState,
} from "@shopify/polaris";
import { useEnv } from "app/context/envcontext";
import { authenticate } from "app/shopify.server";

export async function action({ request }) {
  return null;
}

export async function loader({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  if (!session) return null;
  console.log("session:", session);
  return session?.shop;
}

export default function FilesPage() {
  const { apiKey } = useEnv();
  const shop = useLoaderData();

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
          <Text as="span">Storage Available</Text>
          <ProgressBar progress={50} />
          <Button>Clear Files</Button>
        </Layout.Section>
        <Layout.Section>
          <Card>
            Collection of all of the files submitted. Merchants can clear files
            individually, download files individually or based on selection. The
            table will indicate if the file is connected to an order or not.
          </Card>

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
          {/* ! Will need to create a state object to determine if there are submitted files or not. */}
          <EmptyState
            heading="No files uploaded yet!"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            action={{
              content: "Enable App Bridge",
              target: "_blank",
              url: `https://${shop}/admin/themes/current/editor?context=apps&template=body&activateAppId=${apiKey}/upfile-app-bridge-embed`,
            }}
          >
            {/* TODO: Would be great to be able to detect this ourselves! */}
            <p>Do you have the Upfile App Bridge enabled?</p>
          </EmptyState>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
