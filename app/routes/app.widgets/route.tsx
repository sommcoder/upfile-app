import SmallIndexTable from "app/components/SmallTable/SmallTable";
import LargeDataTable from "app/components/LargeTable/LargeTable";

export async function action({ req, res }: { req: Request; res: Response }) {
  return null;
}

export async function loader() {
  return null;
}

export default function OrdersPage() {
  /*
   
  1) would be great to be able to duplicate existing widgets
  2) theme app blocks would need to be manually added
  3) injection widgets
   
  - The widget will be a dynamic route
  TODO: send data down and swap components based on the size of the screen width
  */
  return (
    <div style={{ margin: "0px 8px" }}>
      <LargeDataTable></LargeDataTable>
      <SmallIndexTable></SmallIndexTable>
    </div>
  );
}
