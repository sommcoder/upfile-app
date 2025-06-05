import SmallIndexTable from "app/components/SmallTable/SmallTable";
import LargeDataTable from "app/components/LargeTable/LargeTable";
import { Card, FooterHelp, Text } from "@shopify/polaris";
import { Link } from "@remix-run/react";
import Footer from "app/components/FooterHelp/FooterHelp";

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
  TODO: send data down and swap components based on the size of the screen width
  */
  return (
    <div style={{ margin: "0px 8px" }}>
      <Card>
        <Text as="h1">Injected Widgets</Text>
        <Link to={"/app/widgets/widget"}>Widget 123</Link>
      </Card>
      <Card>
        <Text as="h1">Theme Block Widgets</Text>
      </Card>
      <LargeDataTable></LargeDataTable>
      <SmallIndexTable></SmallIndexTable>
      <Footer />
    </div>
  );
}
