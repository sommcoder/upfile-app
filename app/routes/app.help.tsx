import { Button, Card, InlineStack, Text, Page } from "@shopify/polaris";

export async function action() {
  return null;
}

export async function loader() {
  return null;
}

export default function HelpPage() {
  return (
    <Page>
      <Card>
        <Text as="h1">Need Assistance?</Text>
        <Text as="span">
          Our devs can help you through the process! We're based in Toronto,
          Canada and can make sure your installation and implementation of our
          app is successful!
        </Text>
        <InlineStack>
          <Button>Email</Button>
          <Button>What's App</Button>
        </InlineStack>
      </Card>
      <Card>
        <Button>Post Review</Button>
      </Card>
    </Page>
  );
}
