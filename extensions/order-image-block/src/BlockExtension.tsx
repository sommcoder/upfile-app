import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Image,
  Text,
  Link,
} from "@shopify/ui-extensions-react/admin";
import { useEffect, useState } from "react";
// ! Took off the /admin path. this solved the issue of the dev mode being launched however I'm sure the admin block is now broken.
// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.order-details.block.render";

export default reactExtension(TARGET, () => <App />);

/*
 
! looks like handling active orders and fulfilled orders is handled differently!?
 


WHY do we even need an admin block if the asset is connected to the metafield?

I guess the only point would be if we can display it as an image for quick reference.
*/

async function getOrderImage(id) {
  const results = Promise.all();
  const res = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify({
      query: `query GetOrderImage($id: ID!) {
            order(id: $id) {
              metafield(namespace: "custom", key: "order_image") {
              value
            }
          }  
        }
      `,
      variables: { id },
    }),
  });
  if (!res.ok) {
    console.error("HTTP Error:", res.status, res.statusText);
    return null;
  }

  const json = await res.json();

  if (json.errors) {
    console.error("GraphQL Errors:", json.errors);
    return null;
  }

  const urlString: string = json.data.order.metafield.value;

  console.log("GraphQL res:", json);

  const res2 = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify({
      query: `query GetFileDetails($fileId: ID!) {
                file(id: $fileId) {
                url
              }
            }
      `,
      variables: { fileId: urlString },
    }),
  });

  if (!res2.ok) {
    console.error("HTTP Error:", res2.status, res2.statusText);
    return null;
  }

  const json2 = await res2.json();

  console.log("json2:", json2);

  if (json2.errors) {
    console.error("GraphQL Errors:", json2.errors);
    return null;
  }

  return json.data.order.metafield.value;
}

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  const { i18n, data } = useApi(TARGET);

  // ! I'm thinking we should include the RAW file, whether it's pdf or cad or whatever but ALSO a picture of the file through the sharp library so that the merchant/user can view the file in the order as opposed to having to download it which seems to be one of the limitations of.

  // ! The other option could be that this is a call to OUR DB. however I would prefer NOT to! Best to store on Shopify.

  // you can make DIRECT api calls through the query API
  // any fetch requests from extension to Admin GQL API are automatically authenticated by default

  const [orderImage, setOrderImage] = useState();

  // run on load or when the data changes
  useEffect(() => {
    const orderId = data.selected?.[0]?.id;
    console.log("orderId:", orderId);

    // are we not getting an error because gQL still returns a status 200?
    getOrderImage(orderId)
      .then(({ data }) => setOrderImage(data))
      .catch((error) => console.log("error.message:", error.message));
  }, [data]);

  console.log("orderImage:", orderImage);

  return (
    // The AdminBlock component provides an API for setting the title of the Block extension wrapper.

    // will probably want a relative URL to go to the specific corresponding order in the app from this order details page the user is viewing!
    // <Link to={`/reviews/${product.id}`} />;
    <AdminBlock title="Associated Order Image">
      <BlockStack>
        {orderImage ? (
          <Image
            src={orderImage || ""}
            alt="Renders an associated image for the order"
          ></Image>
        ) : (
          <Text>No File Submitted For This Order</Text>
        )}
      </BlockStack>
    </AdminBlock>
  );
}
