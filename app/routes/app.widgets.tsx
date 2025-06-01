import { Card, Page, Text } from "@shopify/polaris";
import { Link } from "@remix-run/react";

export async function action({ req, res }: { req: Request; res: Response }) {
  return null;
}

export async function loader() {
  return null;
}

export default function OrdersPage() {
  /*
   
  1) would be great to be able to duplicate existing widgets
  2) theme app blocks would need to be manually added
  3) injection widgets
   

  - The widget will be a dynamic route
  */
  return (
    <Page
      title="Widgets"
      subtitle="Widgets allow users to send you files across your site. Each widget can be configured to your specific needs. Files are submitted on Products or Carts and received when an order is placed with the files connected."
    >
      <Card>
        <Text as="h1">Injected Widgets</Text>
        <Link to="/app/widgets/123">Widget 123</Link>
      </Card>
      <Card>
        <Text as="h1">Theme Block Widgets</Text>
      </Card>
    </Page>
  );
}
