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

async function getMetaData(id) {
  // const results = Promise.all();
  const res = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify({
      query: `query getMetaData($id: ID!) {
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

  const data = await res.json();

  console.log("data:", data);

  return data;
}

function App() {
  // The useApi hook provides access to several useful APIs like i18n and data.
  const { i18n, data } = useApi(TARGET);

  console.log("data:", data);
  // ! We should display as a link

  // you can make DIRECT api calls through the query API
  // any fetch requests from extension to Admin GQL API are automatically authenticated by default

  const [orderImage, setOrderImage] = useState();

  // run on load or when the data changes
  // useEffect(() => {
  //   const orderId = data.selected?.[0]?.id;
  //   console.log("orderId:", orderId);

  //   // are we not getting an error because gQL still returns a status 200?
  //   getOrderImage(orderId)
  //     .then(({ data }) => setOrderImage(data))
  //     .catch((error) => console.log("error.message:", error.message));
  // }, [data]);

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
