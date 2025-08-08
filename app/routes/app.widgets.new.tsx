import { TitleBar, useAppBridge, Modal } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Button,
  Card,
  ChoiceList,
  Divider,
  Form,
  Icon,
  InlineGrid,
  InlineStack,
  Page,
  Select,
  Text,
  TextField,
  Tooltip,
} from "@shopify/polaris";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductModal } from "app/components/ProductModal/ProductModal";
import { statusOptions } from "app/constants/newWidgetForm";
import { FileTypeAccordionList } from "app/components/FileTypeAccordionList/FileTypeAccordionList";
import WidgetStatusSection from "app/components/WidgetStatusSection/WidgetStatusSection";

export async function action() {
  return null;
}

export async function loader() {
  return null;
}

export default function NewWidgetPage() {
  const shopify = useAppBridge();
  const [selectedType, setSelectedType] = useState("block");
  const [selectedStatus, setSelectedStatus] = useState("draft");

  const handleSelectChange = useCallback(
    (value: string) => setSelectedType(value),
    [],
  );

  // useEffect(() => {
  //   console.log("USE-EFFECT TEST?");
  //   shopify.saveBar.show("2");
  // });

  /*
   add a class to the divs for an accordion UI:
  style={{ maxHeight: "0px", overflowY: "hidden" }}
   
  */

  return (
    <Page>
      <TitleBar title="Add Widget" />

      <Form onSubmit={() => null}>
        <ProductModal />
        <InlineGrid gap={"300"} columns={["twoThirds", "oneThird"]}>
          <BlockStack gap={"300"}>
            <Card>
              <BlockStack gap={"200"}>
                <TextField label="Name" autoComplete="off" />
                {/* <Tooltip
                  active
                  hoverDelay={500}
                  content={
                    "Widgets can be blocks, added manually to a theme or injected into dynamic surfaces like cart drawers and even cart apps"
                  }
                > */}
                <span style={{ cursor: "pointer" }}>Type</span>
                <ChoiceList
                  onChange={handleSelectChange}
                  selected={selectedType}
                  title=""
                  name="Widget Type"
                  choices={[
                    { label: "Block", value: "Block" },
                    { label: "Injection", value: "Injection" },
                  ]}
                />
              </BlockStack>
            </Card>
            <Card>
              <InlineStack align="center" gap={"600"}>
                {/* This are the technical inputs. These ought to be LOCKED based on the plan. should include an actionable link to go to plan to upgrade */}
                <TextField label="Max File Size" autoComplete="off" value="" />
                <TextField label="Max File Count" autoComplete="off" value="" />
              </InlineStack>
            </Card>
            <Card>
              {/* OPT IN - Advise merchants to only select what they need and nothing more. More options = more risk, also more memory consumption */}
              <FileTypeAccordionList />
            </Card>
            <Card>
              <InlineStack gap={"200"}>
                <TextField
                  placeholder="Search products"
                  label=""
                  autoComplete="false"
                />
                <Button
                  onClick={() => {
                    console.log("TEST CLICK");
                    shopify.modal.show("product-resource-modal");
                  }}
                >
                  Browse
                </Button>
              </InlineStack>
              <img
                style={{ height: "35px" }}
                src="https://cdn.shopify.com/shopifycloud/web/assets/v1/vite/client/en/assets/tag-icon-DRV-C5YVuJdV.svg"
                alt="No Products"
              />
              <Text as="p">
                There are no products connected to this widget.
                <br />
                Search or browse to add the widget to products.
              </Text>
            </Card>
          </BlockStack>
          <WidgetStatusSection />
        </InlineGrid>
      </Form>
    </Page>
  );
}
