import { BlockStack, Card } from "@shopify/polaris";
import MonacoClientOnly from "../MonacoEditor/MonacoEditor";

export default function CustomInjectionCard() {
  return (
    <BlockStack gap="500">
      <Card>
        <div style={{ height: "500px" }}>
          <MonacoClientOnly defaultLanguage="html" defaultValue="" />
        </div>
      </Card>
      <Card>
        <div style={{ height: "500px" }}>
          <MonacoClientOnly defaultLanguage="css" defaultValue="" />
        </div>
      </Card>
      <Card>
        <div style={{ height: "500px" }}>
          <MonacoClientOnly defaultLanguage="javascript" defaultValue="" />
        </div>
      </Card>
    </BlockStack>
  );
}
