import { FooterHelp, Link } from "@shopify/polaris";

export default function Footer() {
  return (
    <FooterHelp>
      Learn more about{" "}
      <Link url="https://help.shopify.com/manual/orders/fulfill-orders">
        fulfilling orders
      </Link>
    </FooterHelp>
  );
}
