import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page, Card } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  /* 
  in a Remix loader, we often want to:
  1) authenticate the request
  2) return the data
  3) useLoaderData in the UI Component to GET the data and then render it however you want there
  4) if slow, you can use defer in your loader which will wait until the UI is rendered before it runs your loader code.

  import defer

  return defer(
  { your data }
  );

  use a <Suspense fallback={<Skeleton/>}>
  
  */

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return null;
};

export default function Index() {
  return (
    <Page>
      <TitleBar title="Drops: File Uploads for Orders"></TitleBar>
      <Card>This is the Home Page</Card>
    </Page>
  );
}
