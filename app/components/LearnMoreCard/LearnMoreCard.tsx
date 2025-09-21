import { Card, Text, List } from "@shopify/polaris";

export default function LearnMoreCard() {
  return (
    <Card>
      <Text as="h1" fontWeight="bold">
        Learn More
      </Text>
      <Text as="h1" fontWeight="regular">
        Get the most out of UpFile for your bespoke file uploading needs!
      </Text>
      <List type="bullet">
        <div style={{ marginBottom: "12px" }}></div>
        <List.Item>
          <a href="/">How to create File Upload Widget</a>
        </List.Item>
        <List.Item>
          <a href="/">How to style File Upload Widget</a>
        </List.Item>
        <List.Item>
          <a href="/">How to test your Widgets</a>
        </List.Item>
      </List>
    </Card>
  );
}
