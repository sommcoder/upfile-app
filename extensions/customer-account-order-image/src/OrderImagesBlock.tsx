import {
  reactExtension,
  View,
  ImageGroup,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { ResourceItem } from "@shopify/ui-extensions/customer-account";

export default reactExtension(
  "customer-account.order-status.block.render",
  () => <OrderImageList />,
);

function OrderImageList() {
  const { i18n } = useApi();

  // submitted files will be here.
  // we will render a selection of images of the files that have been submitted for this order

  return (
    <View maxInlineSize={200}>
      <ImageGroup variant="inline-stack" totalItems={3}>
        {/* <ResourceItem
          accessibilityLabel="Resource Item"
          onPress={() => {}}
          actionLabel="Manage"
          action={<Image source=""></Image>}
        >
          Image #1
        </ResourceItem> */}
        <Image source=""></Image>
      </ImageGroup>
    </View>
  );
}
