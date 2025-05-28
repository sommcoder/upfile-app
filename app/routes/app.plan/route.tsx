export async function action() {
  return null;
}

export async function loader() {
  return null;
}

export default function PlanPage() {
  // URL =  https://admin.shopify.com/store/:store_handle/charges/:app_handle/pricing_plans

  /*
   
  when using managed pricing, Shopify hosts your plan selection page.


  Pass app review: test your app's billing system:
  To have your app create a test charge, you can change your app's charge requests to include "test": true. This will create a test charge when you install the app so that you don't incur a real charge on your account.
   
  */

  return (
    <div>Plan. Shopify will handle the UI if we're using managed billing</div>
  );
}
