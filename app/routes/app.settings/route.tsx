import { SaveBar, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ChoiceList,
  Form,
  FormLayout,
  InlineStack,
  Layout,
  Page,
  ProgressBar,
  Text,
  TextField,
} from "@shopify/polaris";
import { Knob } from "app/components/knob/Knob";
import { useCallback, useState } from "react";

import CustomInjectionCard from "app/components/CustomInjectionCard/CustomInjectionCard";

export async function action({ req, res }: { req: Request; res: Response }) {
  return null;
}

export async function loader() {
  return null;
}

export default function SettingsPage() {
  const shopify = useAppBridge();

  const handleSave = () => {
    console.log("Saving");
    shopify.saveBar.hide("my-save-bar");
  };

  const handleDiscard = () => {
    console.log("Discarding");
    shopify.saveBar.hide("my-save-bar");
  };

  const [newsletter, setNewsletter] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = useCallback(() => {
    setEmail("");
    setNewsletter(false);
  }, []);

  const handleNewsLetterChange = useCallback(
    (value: boolean) => setNewsletter(value),
    [],
  );

  const handleEmailChange = useCallback((value: string) => setEmail(value), []);

  const [selected, setSelected] = useState<string[]>(["hidden"]);

  const handleChange = useCallback((value: string[]) => setSelected(value), []);

  const [checked, setChecked] = useState(false);

  return (
    <Page>
      <TitleBar title="Settings" />

      <Layout>
        <Layout.Section>
          <FormLayout>
            <form data-save-bar onSubmit={handleSubmit}>
              <Form onSubmit={handleSubmit}>
                <FormLayout>
                  <Checkbox
                    label="Sign up for the Polaris newsletter"
                    checked={newsletter}
                    onChange={handleNewsLetterChange}
                  />

                  <TextField
                    value={email}
                    onChange={handleEmailChange}
                    label="Email"
                    type="email"
                    autoComplete="email"
                    helpText={
                      <span>
                        We'll use this email address to inform you on future
                        changes to Polaris.
                      </span>
                    }
                  />
                  <TextField
                    value={email}
                    onChange={handleEmailChange}
                    label="Email"
                    type="email"
                    autoComplete="email"
                    helpText={
                      <span>
                        We'll use this email address to inform you on future
                        changes to Polaris.
                      </span>
                    }
                  />
                  <Checkbox
                    label="Allow Multi-File Submissions"
                    checked={checked}
                    onChange={handleChange}
                  />

                  <Card>
                    <InlineStack align="space-between">
                      <InlineStack align="start" gap="200" blockAlign="center">
                        <Text as="p" variant="bodyMd">
                          Enable Multi-File Submissions
                        </Text>
                        <Badge tone={selected ? "success" : "attention"}>
                          {selected ? "Enabled" : "Disabled"}
                        </Badge>
                      </InlineStack>
                      <Knob
                        selected={selected}
                        ariaLabel="Enable Multi-File Submissions"
                        onClick={() => setSelected((prev) => !prev)}
                      />
                    </InlineStack>
                  </Card>
                  {/* would be great to show an image EXAMPLE here of what this would look like. Also probably improve the verbiage. */}

                  <Card>
                    <ChoiceList
                      title="Customer Account Page Render"
                      choices={[
                        { label: "Product", value: "Product" },
                        { label: "product List", value: "product List" },
                      ]}
                      selected={selected}
                      onChange={handleChange}
                    />
                  </Card>

                  <Text as="span" fontWeight="bold">
                    Permitted File Types:
                  </Text>
                  <InlineStack gap="300">
                    {/* value is the MIMETYPE */}
                    <div>
                      <Card>
                        <ChoiceList
                          allowMultiple
                          title="Image Types:"
                          choices={[
                            { label: "png", value: "image/png" },
                            { label: "jpeg", value: "image/jpeg" },
                            { label: "jpg", value: "image/jpg" },
                          ]}
                          selected={selected}
                          onChange={handleChange}
                        />
                      </Card>
                    </div>

                    <Card>
                      <ChoiceList
                        allowMultiple
                        title="CAD Types:"
                        choices={[
                          { label: ".dwg", value: "image/x-dwg" },
                          { label: ".dxf", value: "image/x-dxf" },
                          { label: ".dwf", value: "drawing/x-dwf" },
                        ]}
                        selected={selected}
                        onChange={handleChange}
                      />
                    </Card>
                    <Card>
                      <ChoiceList
                        allowMultiple
                        title="3D Printer Types:"
                        choices={[
                          {
                            label: ".stl",
                            value:
                              "model/stl,model/x.stl-ascii, model/x.stl-binary",
                          },
                        ]}
                        selected={selected}
                        onChange={handleChange}
                      />
                    </Card>
                    <Card>
                      <ChoiceList
                        allowMultiple
                        title="Generic Types:"
                        choices={[{ label: "pdf", value: "application/pdf" }]}
                        selected={selected}
                        onChange={handleChange}
                      />
                    </Card>
                  </InlineStack>
                  <CustomInjectionCard />
                  <Button submit>Save</Button>
                </FormLayout>
              </Form>
            </form>
          </FormLayout>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
