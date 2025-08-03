import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page, Banner, Button, BlockStack } from "@shopify/polaris";
import { SetupGuide } from "app/components/SetupGuide/SetupGuide";
import { useState } from "react";
import { authenticate } from "app/shopify.server";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEnv } from "app/context/envcontext";
import { getMainThemeContent } from "app/transactions/onboarding";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  if (!session) throw new Response("Unauthorized", { status: 401 });

  // TODO: if store is LIVE (not dev), passed free trial and NOT on a paid plan, prevent the storefront UI from working. Probably should pass a app-owned metafield to the app bridge block to restrict usage! Ideally we should just render NOTHING with a console.warn to notify the merchant that we're NOT messing up their UI BUTTTTT they need to get onto a paid plan in order for their users to actually use our service.
  // 1) get main theme data
  const { mainTheme } = await getMainThemeContent(admin);
  console.log("mainTheme", mainTheme);

  // return { shop: session.shop, themeBlockData: themeBlockData };
  return { shop: session.shop, mainTheme: mainTheme };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!session) throw new Response("Unauthorized", { status: 401 });
  // console.log("LOAD REQUEST::::", request);

  // // split the function based on a param condition?

  // // get settings from main theme:
  // const mainThemeConfigSettings = await fetchDataByGQLBody(
  //   admin,
  //   getFileSettingsContent(mainTheme.id, fileName),
  // );

  return null;
};

export default function IndexPage() {
  const { themeBlockId, apiKey, shopSettings } = useEnv();
  const { shop, mainTheme } = useLoaderData<typeof loader>();
  const isGuideComplete =
    shopSettings["setup-guide-progress"]["init-setup-complete"];

  // TODO: used to get each buttons corresponding file data for processing:
  const fileData = useFetcher<typeof loader>({ key: "get-theme-file-data" });
  fileData.load("/");
  console.log("themeBlockId:", themeBlockId);

  // will be: shopSettings["setup-guide-progress"]["init-setup-complete"]
  const [showGuide, setShowGuide] = useState(true);

  console.log(
    "shopSettings['setup-guide-progress']:",
    shopSettings["setup-guide-progress"],
  );
  // this data can be stored on the merchant's store metafields
  // this is the TRUE data source
  // const [setupProgress] = useState(
  //   shopSettings["setup-guide-progress"],
  // );

  /*

   const mainThemeConfigSettings = await fetchDataByGQLBody(
     admin,
     getFileSettingsContent(mainTheme.id, fileName),
   );
   
  */
  // const themeBlockData = await getMainThemeContent(admin);
  /*
 
1) get our SHOP data and see where we are in the onboarding process
2) if step not complete:
    a) action start polling the related file
        - app bridge = config/settings_data.json
        - app block = product OR cart depending on click
        - don't need to navigate, just need user to then enter parent selector on the cart drawer or cart app, we can offer support here.
3) select a plan just navigates user to the Shopify managed plan page




*/

  // Maybe poll for 30 seconds max, after that have a warning message pop up to inform the user that we didn't 'detect' changes to their theme, maybe their {{ file_name }} is a diff name and that they will have to manually verify that the block is activated themselves. also maybe provide another deep link text just in case and the button will be disabled and the step completed!

  // Could not find file: {{ file_name }} to detect completion, please manually verify that UpFile {{ block_name }} is active

  // function pollThemeForChanges(fileName: string) {
  //   // a function that continually checks for the INCLUSION of a particular blockId in the specified file on the MAIN theme. If included, stop polling and allow the user to progress to the next step in the setup guide.
  // }

  // const ITEMS = [];
  // this is for the UI state:
  // app block:
  // https://<myshopifyDomain>/admin/themes/current/editor?template=${template}&addAppBlockId={api_key}/{handle}&target=newAppsSection

  // App embed:
  // https://<myshopifyDomain>/admin/themes/current/editor?context=apps&template=${template}&activateAppId={api_key}/{handle}
  const ITEMS = [
    {
      id: 0,
      required: true,
      title:
        "Activate 'UpFile App Bridge' App Embed <strong>(required)</strong>",
      description:
        "Required for app functionality. Follow the link in a new tab and save",
      image: {
        url: "/app/images/app-bridge-graphic.svg",
        alt: "Click to activate the Upfile App Bridge App Embed",
      },
      complete: false,
      buttonOptions: {
        buttonStyle: "primary",
        content: "Activate App",
        props: {
          target: "_blank",
          url: `https://${shop}/admin/themes/current/editor?context=apps&template=body&activateAppId=${apiKey}/upfile-app-bridge-embed`,
          external: false,
        },
      },
      action: () => {
        console.log("BUTTON CLICK TEST");
        fileData.load(`/app?file=config/settings_data.json`);
      },
    },
    {
      id: 1,
      required: false,
      title:
        "Choose a location for the Upfile Theme Block <strong>(optional)</strong>",
      description:
        "Add UpFile as a theme block on a product or cart template or inject UpFile into your cart-drawer or <a target='_blank' href='https://apps.shopify.com/upcart-cart-builder?search_id=1396b671-29a0-46ac-8afe-819cdff495b9&shallow_install_type=search&surface_detail=UpCart&surface_inter_position=1&surface_intra_position=1&surface_type=search'>3rd party cart app</a>. (choose one location to onboard).",
      image: {
        url: "/app/images/app-block-graphic.svg",
        alt: "Illustration showing an online storefront with a 'share' icon in top right corner",
      },
      action: () => console.log("copied store link!"),
      complete: false,
      buttonOptions: {
        buttonStyle: "primary",
        content: "Product template",
        props: {
          target: "_blank",
          url: `https://${shop}/admin/themes/current/editor?template=product&addAppBlockId=${themeBlockId}/upfile-theme-block&target=mainSection`,
          external: false,
        },
      },
    },
    {
      id: 2,
      required: false,
      title:
        "Inject The Upfile Block Into a Dynamic Surface  <strong>(optional)</strong>",
      description:
        "Add UpFile as a theme block on a product or cart template or inject UpFile into your cart-drawer or <a target='_blank' href='https://apps.shopify.com/upcart-cart-builder?search_id=1396b671-29a0-46ac-8afe-819cdff495b9&shallow_install_type=search&surface_detail=UpCart&surface_inter_position=1&surface_intra_position=1&surface_type=search'>3rd party cart app</a>. (choose one location to onboard).",
      image: {
        url: "/app/images/injected-block-graphic.svg",
        alt: "Illustration showing an online storefront with a 'share' icon in top right corner",
      },
      action: () =>
        console.log("open up an input field to enter the parent selector"),
      complete: false,
      buttonOptions: {
        buttonStyle: "secondary",
        content: "Inject into /cart-drawer",
        props: {
          target: "_blank",
          url: `#`,
          external: false,
        },
      },
    },
    {
      id: 3,
      required: false,
      title: "Select a plan! <strong>(required to go live)</strong>",
      description:
        "Select a plan to migrate to after your <strong>14 day free trial </strong> expires! (dev stores can remain on the basic plan indefinitely)",
      image: {
        url: "/app/images/paid-plan-graphic.svg",
        alt: "Plan selection illustration",
      },
      complete: false,
      buttonOptions: {
        buttonStyle: "primary",
        content: "Select a plan",
        props: {
          url: "/app/plan",
          external: false,
        },
      },
    },
  ];
  const [items, setItems] = useState(ITEMS);

  // Example of step complete handler, adjust for your use case
  const onStepComplete = async (id: any) => {
    // API call to update completion state in DB, etc.
    await new Promise<void>((res) =>
      setTimeout(() => {
        res();
      }, 1000),
    );

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, complete: !item.complete } : item,
      ),
    );
  };

  if (!showGuide)
    return <Button action={() => setShowGuide(true)}>Show Setup Guide</Button>;

  return (
    <Page>
      {/* This is the home, for news/updates and info*/}
      <BlockStack gap={"400"}>
        {/* Dev Banner should only show if store is NOT live */}
        <Banner title="Dev Store Notice">
          <p>
            This app is <strong>free to test</strong> with basic plan features
            while the store is under development.
            <br />
            <br />
            Once your store goes live you will need to select a paid plan that
            will begin after the completion of your free trial.
          </p>
        </Banner>
        {isGuideComplete ? (
          <div>Build/Edit your widgets</div>
        ) : (
          <SetupGuide
            onDismiss={() => {
              setShowGuide(false);
              setItems(ITEMS);
            }}
            onStepComplete={onStepComplete}
            items={items}
          />
        )}
      </BlockStack>
    </Page>
  );
}
