import { FooterHelp, Icon, Link } from "@shopify/polaris";
import { ChatIcon } from "@shopify/polaris-icons";
export default function Footer() {
  return (
    <FooterHelp>
      <div style={{ display: "flex" }}>
        Need help configuring UpFile?&nbsp;
        <Link url="https://help.shopify.com/manual/orders/fulfill-orders">
          Message us!
        </Link>
        &nbsp;
        <Icon source={ChatIcon} />
      </div>
    </FooterHelp>
  );
}
