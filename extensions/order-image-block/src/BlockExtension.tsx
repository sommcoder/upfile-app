import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Text,
  Link,
} from "@shopify/ui-extensions-react/admin";

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.order-details.block.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  const { i18n, data } = useApi(TARGET);
  console.log({ data });

  return (
    // The AdminBlock component provides an API for setting the title of the Block extension wrapper.

    // will probably want a relative URL to go to the specific corresponding order in the app from this order details page the user is viewing!
    // <Link to={`/reviews/${product.id}`} />;
    <AdminBlock title="My Block Extension">
      <BlockStack>
        <Text fontWeight="bold">{i18n.translate("welcome", { TARGET })}</Text>
        <Link to="app:/submit">submit</Link>
      </BlockStack>
    </AdminBlock>
  );
}
