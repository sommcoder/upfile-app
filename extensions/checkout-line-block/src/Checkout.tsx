import {
  reactExtension,
  BlockStack,
  Text,
  useApi,
  // useApplyAttributeChange,
  useTranslate,
  Image,
  useCartLineTarget,
} from "@shopify/ui-extensions-react/checkout";

// 1. Choose an extension target
export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  // const cartLinesArr = useCartLines();
  const { extension } = useApi();
  console.log("extension:", extension);
  const { attributes } = useCartLineTarget();
  console.log("attributes:", attributes);
  // const applyAttributeChange = useApplyAttributeChange();

  /*
- Need to check for the private property on the line item and render the image.
- Maybe we WILL need to add the image to the CDN of the merchant so that we can show this image here. 
- Otherwise we'd have to share our storage bucket URL for the image. which is apparently less performant?

LOGIC: IF the private property exists render image
*/

  return (
    <BlockStack border={"dotted"} padding={"tight"}>
      <Text>Submitted Images go Here!</Text>
      {/* <Image source="" /> */}
    </BlockStack>
  );
}
