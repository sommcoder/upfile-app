import { TitleBar } from "@shopify/app-bridge-react";
import {
  Button,
  Card,
  Checkbox,
  FormLayout,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";

export async function action({ req, res }: { req: Request; res: Response }) {
  return null;
}

export async function loader() {
  return null;
}

export default function SettingsPage() {
  return (
    <Page>
      <TitleBar title="Settings" />
      <Card>A list of settings and the selected plan for the merchant</Card>
      <Layout>
        <Layout.Section>
          <FormLayout>
            <TextField
              label="Store name"
              onChange={() => {}}
              autoComplete="off"
            />
            <TextField
              type="email"
              label="Account email"
              onChange={() => {}}
              autoComplete="email"
            />
            <Checkbox
              label="Sign up for the Polaris newsletter"
              checked={true}
              onChange={() => {}}
            />
            <Button submit>Save</Button>
          </FormLayout>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
