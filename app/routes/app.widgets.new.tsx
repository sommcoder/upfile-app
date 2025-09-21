import {
  TitleBar,
  useAppBridge,
  Modal,
  SaveBar,
} from "@shopify/app-bridge-react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  Checkbox,
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
import "../styles/admin-app.css";

export async function action() {
  return null;
}

export async function loader() {
  return null;
}

export default function NewWidgetPage() {
  const shopify = useAppBridge();
  const [selectedType, setSelectedType] = useState<
    null | "block" | "injection"
  >(null);
  const handleTypeSelection = (ev) => {
    console.log("ev:", ev);
    console.log("ev:", ev.currentTarget);
    console.log("ev:", ev.target);

    setSelectedType(ev.target.dataset.type);
  };

  const [selectedStatus, setSelectedStatus] = useState("draft");
  const [widgetStatus, setWidgetStatus] = useState("Draft");

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

  // I guess at the end of the day the "widget" and be a field of a form, so fully

  const [checked, setChecked] = useState(false);
  const handleChange = useCallback(
    (newChecked: boolean) => setChecked(newChecked),
    [],
  );

  return (
    <Page
      backAction={{ content: "Settings", url: "#" }}
      title="New Upload  Widget"
      titleMetadata={<Badge tone="info">{widgetStatus}</Badge>}
      primaryAction={<Button variant="primary">Save</Button>}
    >
      <TitleBar title="Add Widget" />

      {/* TODO: Error banner goes here! */}
      {/* <Banner>error</Banner> */}
      <Form onSubmit={() => null}>
        <ProductModal />
        <InlineGrid gap={"300"} columns={["twoThirds", "oneThird"]}>
          <BlockStack gap={"300"}>
            <Card>
              <BlockStack gap={"200"}>
                <TextField label="Name*" autoComplete="off" />
                {/* <Tooltip
                  active
                  hoverDelay={500}
                  content={
                    "Widgets can be blocks, added manually to a theme or injected into dynamic surfaces like cart drawers and even cart apps"
                  }
                > */}
                <span>Widget Type*</span>
                <div className="widget-type-card">
                  <span
                    className={`widget-type-card-section ${selectedType === "block" ? "active" : ""}`}
                    onClick={handleTypeSelection}
                    data-type="block"
                  >
                    <span className="widget-type-card-section--text">
                      Block
                    </span>
                  </span>
                  <span
                    className={`widget-type-card-section ${selectedType === "injection" ? "active" : ""}`}
                    onClick={handleTypeSelection}
                    data-type="injection"
                  >
                    <span className="widget-type-card-section--text">
                      Injection
                    </span>
                  </span>
                </div>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack align="start" gap={"600"}>
                {/* TODO: This are the technical inputs. These ought to be LOCKED based on the plan. should include an actionable link to go to plan to upgrade */}
                <TextField label="Max File Size" autoComplete="off" value="" />
                <TextField label="Max File Count" autoComplete="off" value="" />
              </BlockStack>
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
