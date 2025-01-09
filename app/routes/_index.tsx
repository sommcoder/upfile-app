import { Link, Outlet } from "@remix-run/react";

import { NavMenu } from "@shopify/app-bridge-react";

export default function App() {
  return (
    <>
      <NavMenu>
        <Link to="/" rel="home">
          Home
        </Link>
        <Link to="/products">Products</Link>
        <Link to="/files">Files</Link>
        <Link to="/settings">Settings</Link>
      </NavMenu>
      <Outlet />
    </>
  );
}
