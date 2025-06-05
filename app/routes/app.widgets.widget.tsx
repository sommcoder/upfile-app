import { useParams } from "@remix-run/react";
import { Card, Page, Text } from "@shopify/polaris";

export async function action({ req, res }: { req: Request; res: Response }) {
  return null;
}

export async function loader() {
  return null;
}

export default function OrdersPage() {
  const { widgetId } = useParams();
  /*
   
  1) would be great to be able to duplicate existing widgets
  2) theme app blocks would need to be manually added
  3) injection widgets
   
  */
  return (
    <Page title={`Widget: ${widgetId}`} subtitle="Individual widget route">
      <Card>
        <Text as="h1">Widget</Text>
      </Card>
      <Card>
        <Text as="h1">Theme Block Widgets</Text>
      </Card>
    </Page>
  );
}
