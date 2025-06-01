import { SaveBar, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import {
  Badge,
  BlockStack,
  Box,
  Button,
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
  Text,
  Text,
  Divider,
  useBreakpoints,
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
      <TitleBar title="Settings" />

      <Layout>
        <Layout.Section>
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
              <Card></Card>
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
                  <Text as="p" variant="bodyMd">
                    Interjambs are the rounded protruding bits of your puzzlie
                    piece
                  </Text>
                </BlockStack>
              </Box>
              <Card></Card>
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
