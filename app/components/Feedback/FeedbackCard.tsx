import {
  Card,
  BlockStack,
  Text,
  Button,
  ButtonGroup,
  InlineStack,
} from "@shopify/polaris";
import { XIcon, ThumbsDownIcon, ThumbsUpIcon } from "@shopify/polaris-icons";

export const FeedbackCard = () => {
  return (
    <Card>
      <BlockStack gap="400" align="start">
        <BlockStack gap="200">
          <InlineStack align="space-between">
            <Text as="h2" variant="headingMd">
              Share your feedback
            </Text>
            <XIcon width="1rem" height="1rem" style={{ cursor: "pointer" }} />
          </InlineStack>

          <Text as="p" variant="bodyMd" tone="subdued">
            This app was developed by <strong>BAD Coding</strong> We are a small
            independent Shopify app development firm aiding e-commerce merchants
            with niche tools and functionality for their stores. <br /> <br />
            We focus on small, niche implementations with big impact to your
            business! No app bloat with infinite customizations. We focus on the
            minimum viable product and scale with our clients as needed!
            <br />
            <br />
            How would you describe your experience using this app so far?
          </Text>
        </BlockStack>
        <ButtonGroup>
          <Button icon={ThumbsUpIcon} onClick={() => null}>
            Good
          </Button>
          <Button icon={ThumbsDownIcon} onClick={() => null}>
            Bad
          </Button>
        </ButtonGroup>
      </BlockStack>
    </Card>
  );
};
