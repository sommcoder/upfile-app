import { TitleBar } from "@shopify/app-bridge-react";
import { useParams } from "@remix-run/react";

export async function action() {
  return null;
}

export async function loader() {
  return null;
}

export default function WidgetPage() {
  const { widgetId } = useParams();

  return <TitleBar>Widget #{widgetId}</TitleBar>;
}
