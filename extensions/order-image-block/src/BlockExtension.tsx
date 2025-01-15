import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Text,
  Link,
} from "@shopify/ui-extensions-react/admin";
// ! Took off the /admin path. this solved the issue of the dev mode being launched however I'm sure the admin block is now broken.

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.order-details.block.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  const { i18n, data } = useApi(TARGET);
  console.log({ data });

  // ! I'm thinking we should include the RAW file, whether it's pdf or cad or whatever but ALSO a picture of the file through the sharp library so that the merchant/user can view the file in the order as opposed to having to download it which seems to be one of the limitations of.

  // ! The other option could be that this is a call to OUR DB. however I would prefer NOT to! Best to store on Shopify.

  async function getOrderImage(id) {
    const res = await fetch("shopify:admin/api/graphql.json", {
      method: "POST",
      body: JSON.stringify({
        query: `
        query GetOrder($id: ID!) {
          order(id: $id) {
            image {
            
            }
          }
        }
      `,
        variables: { id },
      }),
    });
    return res.json();
  }
  const orderId = data.selected?.[0]?.id;
  getOrderImage(orderId);

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
