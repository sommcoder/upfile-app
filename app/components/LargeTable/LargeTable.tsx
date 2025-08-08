import {
  Badge,
  IndexTable,
  Card,
  Text,
  useBreakpoints,
  useIndexResourceState,
  Button,
  ButtonGroup,
} from "@shopify/polaris";
import { DeleteIcon, EditIcon } from "@shopify/polaris-icons";

// TODO: clean this up!
export default function LargeDataTable() {
  const newWidgetTest: Omit<UpfileWidget, "id" | "type"> = {
    widgetName: "Test Widget",
    widgetType: "block",
    maxFileSize: 5242880,
    multiFileSubmissionEnabled: true,
    shadowRootEnabled: true,
    maxFileCount: 3,

    blockSettingsId: "1234",
    injectionSettingsId: "4312",

    customHtml: "<div>Test HTML</div>",
    customJs: "console.log('hi');",
    customCss: ".upload { color: #362a2a; }",

    productIdList: ["gid://shopify/Product/123", "gid://shopify/Product/456"],
    collectionIdList: ["gid://shopify/Collection/789"],

    themeActivationType: "main-only",
    validThemeList: ["Dawn", "Craft"],
  };

  const widgetData = [
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
    useIndexResourceState(widgetData);

  const rowMarkup = widgetData.map(
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
        <IndexTable.Cell>
          <EditIcon></EditIcon>
        </IndexTable.Cell>
        {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
          <path d="M4 8a1.5 1.5 0 1 1-3.001-.001 1.5 1.5 0 0 1 3.001.001"></path>
          <path d="M9.5 8a1.5 1.5 0 1 1-3.001-.001 1.5 1.5 0 0 1 3.001.001"></path>
          <path d="M13.5 9.5a1.5 1.5 0 1 0-.001-3.001 1.5 1.5 0 0 0 .001 3.001"></path>
        </svg> */}
      </IndexTable.Row>
    ),
  );

  const promotedBulkActions = [
    {
      content: "Create shipping labels",
      onAction: () => console.log("Todo: implement create shipping labels"),
    },
  ];
  const bulkActions = [
    {
      content: "Add tags",
      onAction: () => console.log("Todo: implement bulk add tags"),
    },
    {
      content: "Remove tags",
      onAction: () => console.log("Todo: implement bulk remove tags"),
    },
    {
      title: "Import",
      items: [
        {
          content: "Import from PDF",
          onAction: () => console.log("Todo: implement PDF importing"),
        },
        {
          content: "Import from CSV",
          onAction: () => console.log("Todo: implement CSV importing"),
        },
      ],
    },
    {
      icon: DeleteIcon,
      destructive: true,
      content: "Delete customers",
      onAction: () => console.log("Todo: implement bulk delete"),
    },
  ];

  return (
    <Card>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          marginBottom: "12px",
        }}
      ></div>
      <IndexTable
        condensed={useBreakpoints().smDown}
        resourceName={resourceName}
        itemCount={widgetData.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "widget" },
          { title: "Date" },
          { title: "Customer" },
          { title: "Total", alignment: "end" },
          { title: "Payment status" },
          { title: "Fulfillment status" },
          { title: "Edit" },
        ]}
        bulkActions={bulkActions}
        promotedBulkActions={promotedBulkActions}
        // sort={}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}
