import LargeDataTable from "app/components/LargeTable/LargeTable";

import {
  Button,
  Card,
  Form,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { Link, Outlet } from "@remix-run/react";
import {
  Modal,
  SaveBar,
  TitleBar,
  useAppBridge,
} from "@shopify/app-bridge-react";

export async function action({ req, res }: { req: Request; res: Response }) {
  return null;
}

export async function loader() {
  return null;
}

export default function WidgetPage() {
  const shopify = useAppBridge();
  /*
  1) would be great to be able to duplicate existing widgets
  2) theme app blocks would need to be manually added
  3) injection widgets
  4) will need to load all widgets onLoad
      - check for the theme status


  table of widget rows:
  - id (hidden) => needs to be associated with a blockId OR a made up id if injected
  - name: string
  - type: block or injected 
  - active (true, false) overrides the block?
  - status: (live, draft) is it enabled on MAIN theme?
  - themes: a list of themes that the widget has been enabled on (main, all or specified)

global actions:
- create new

inline actions:
- edit:
    - changing everything but id
    - switching a status should deep link and do the same polling process

Selection Actions:
- delete
- switch to active or disabled

Sorting:
 - by any column
   
  - The widget will be a dynamic route
  TODO: send data down and swap components based on the size of the screen width
  */
  return (
    <Page
      primaryAction={
        <Link to="/app/widgets/new">
          <Button
            // style={{ paddingRight: "12px" }}
            // onClick={() => shopify.saveBar.show("my-save-bar")}
            // onClick={() => {
            //   shopify.modal.show("product-resource-modal");
            // shopify.saveBar.show("my-save-bar");
            // }}
            variant="primary"
          >
            New Widget
          </Button>
        </Link>
      }
    >
      <TitleBar title="UpFile - Widget List" />
      <div style={{ margin: "0px 8px" }}>
        <LargeDataTable></LargeDataTable>
      </div>
    </Page>
  );
}

// SHOP SETTINGS INSTANCE:
// TODO: need to delete, finalize widget definition, delete session and restart dev server to initialize the app afterAuth function
