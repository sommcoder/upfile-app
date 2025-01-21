import {
  DropZone,
  reactExtension,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension("customer-account.page.render", () => <App />);

function App() {
  return <DropZone accept="" />;
}
