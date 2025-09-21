import { Card, InlineStack, Text, Badge } from "@shopify/polaris";

export default function AppStatusCard() {
  return (
    <Card>
      <Text as="h1" fontWeight="bold">
        App Status
      </Text>
      <div style={{ marginBottom: "12px" }}></div>
      <InlineStack gap={"300"}>
        <Card>
          <InlineStack gap={"100"}>
            <Text as="h1" fontWeight="bold">
              Live Theme
            </Text>
            <Badge tone="success">Active</Badge>
          </InlineStack>
        </Card>
        {/* Not sold on the need for the other two*/}
        <Card>
          <InlineStack gap={"100"}>
            <Text as="h1" fontWeight="bold">
              Other Themes
            </Text>
            <Badge tone="success">Active</Badge>
          </InlineStack>
        </Card>
        <Card>
          <InlineStack gap={"100"}>
            <Text as="h1" fontWeight="bold">
              Upload Widget
            </Text>
            <Badge tone="success">Active</Badge>
          </InlineStack>
        </Card>
      </InlineStack>
    </Card>
  );
}
