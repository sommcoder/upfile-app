import {
  reactExtension,
  View,
  ImageGroup,
  useApi,
  Text,
  useTarget,
  useAttributeValues,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension(
  "customer-account.order-status.cart-line-item.render-after",
  () => <OrderImageList />,
);

// customer-account.page.render

function OrderImageList() {
  const [buyerSelectedFreeTShirt, tshirtSize] = useAttributeValues([
    "buyerSelectedFreeTShirt",
    "tshirtSize",
  ]);

  // I want to display the file associated with EACH line item

  return <Text>asdasdasd{title}</Text>;
}
