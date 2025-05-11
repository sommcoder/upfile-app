import {
  BlockStack,
  reactExtension,
  TextBlock,
  Banner,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension(
  "customer-account.order-status.cart-line-item.render-after",
  () => <OrderFiles />,
);

function OrderFiles() {
  const { i18n } = useApi();

  return (
    <Banner>
      <BlockStack inlineAlignment="center">
        <TextBlock>{i18n.translate("earnPoints")}</TextBlock>
      </BlockStack>
    </Banner>
  );
}
