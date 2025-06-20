import { SaveBar, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import {
  Badge,
  BlockStack,
  Box,
  Card,
  Checkbox,
  Text,
  ChoiceList,
  Form,
  FormLayout,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Divider,
  useBreakpoints,
  Icon,
  Button,
  ButtonGroup,
  TextField,
} from "@shopify/polaris";
import { CheckCircleIcon } from "@shopify/polaris-icons";
import { Knob } from "app/components/knob/Knob";
import { useCallback, useState } from "react";

import CustomInjectionCard from "app/components/CustomInjectionCard/CustomInjectionCard";

/* 
common cart selectors:
    horizon: 'cart-drawer-component',
    dawn: 'cart-drawer',

    Upcart carts:
    #UpcartPopup
    #Upcart

    Rebuy carts?


*/

export async function action({ req, res }: { req: Request; res: Response }) {
  return null;
}

export async function loader() {
  return null;
}

export default function SettingsPage() {
  const { smUp } = useBreakpoints();

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
      <TitleBar title="UpFile - Settings" />
      <Form>
        <Layout>
          <Layout.Section>
            {/* <SaveBar id="my-save-bar">
            <ButtonGroup>
              <Button>Save</Button>
            </ButtonGroup>
          </SaveBar> */}

            <BlockStack gap={{ xs: "800", sm: "400" }}>
              <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                <Box
                  as="section"
                  paddingInlineStart={{ xs: 400, sm: 0 }}
                  paddingInlineEnd={{ xs: 400, sm: 0 }}
                >
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                      Store-wide Settings
                    </Text>
                    <Text as="p" variant="bodyMd">
                      General settings that affect all widgets
                    </Text>
                  </BlockStack>
                </Box>
                <Card>
                  <BlockStack>
                    <InlineStack align="start">
                      <Icon tone="textSuccess" source={CheckCircleIcon} />
                      <Text as="p">App Bridge enabled</Text>
                    </InlineStack>
                  </BlockStack>
                </Card>
              </InlineGrid>
              {smUp ? <Divider /> : null}
              <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                <Box
                  as="section"
                  paddingInlineStart={{ xs: 400, sm: 0 }}
                  paddingInlineEnd={{ xs: 400, sm: 0 }}
                >
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                      User Settings
                    </Text>
                  </BlockStack>
                </Box>
                <Card>
                  <BlockStack>
                    <InlineStack align="start">
                      <Text as="p">User Email</Text>
                      <TextField
                        label="Store name"
                        // value={textFieldValue}
                        // onChange={handleTextFieldChange}
                        error="Store name is required"
                        autoComplete="off"
                      />
                    </InlineStack>
                  </BlockStack>
                </Card>
              </InlineGrid>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Form>
    </Page>
  );
}
