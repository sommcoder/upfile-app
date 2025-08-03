import LargeDataTable from "app/components/LargeTable/LargeTable";
import { Card, Page, Text } from "@shopify/polaris";
import { Link } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";

export async function action({ req, res }: { req: Request; res: Response }) {
  return null;
}

export async function loader() {
  return null;
}

export default function WidgetPage() {
  /*
  1) would be great to be able to duplicate existing widgets
  2) theme app blocks would need to be manually added
  3) injection widgets


  table of widget rows:
  - name 
  - id (hidden) => needs to be associated with a blockId OR a made up id if injected
  - status (active, disabled)
  - type: block or injected 
  
global actions:
- create new

inline actions:
- edit:
    - changing everything but id
    - switching a status should deep link and do the same polling process

   
  - The widget will be a dynamic route
  TODO: send data down and swap components based on the size of the screen width
  */
  return (
    <Page>
      <TitleBar title="UpFile - Widget List" />
      <div style={{ margin: "0px 8px" }}>
        <Card>
          <Text as="h1">Injected Widgets</Text>
          <Link to={"/app/widgets/widget"}>Widget 123</Link>
        </Card>
        <Card>
          <Text as="h1">Theme Block Widgets</Text>
        </Card>
        <LargeDataTable></LargeDataTable>
      </div>
    </Page>
  );
}
