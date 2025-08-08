import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page, Banner, Button, BlockStack } from "@shopify/polaris";
import { SetupGuide } from "app/components/SetupGuide/SetupGuide";
import { useMemo, useState } from "react";
import { authenticate } from "app/shopify.server";
import { useLoaderData } from "@remix-run/react";
import { useEnv } from "app/context/envcontext";
import { getMainThemeContent } from "app/transactions/onboarding";
import { pollForBlockActivation } from "app/hooks/PollStorefront";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  if (!session) throw new Response("Unauthorized", { status: 401 });
  console.log("/app._index loader - session:", session);

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

  // TODO: this should be where we submit the forms on the page

  return null;
};

export default function IndexPage() {
  const { themeBlockId, apiKey, shopSettings } = useEnv();
  console.log("IndexPage shopSettings:", shopSettings);

  const { shop, mainTheme } = useLoaderData<typeof loader>();

  const isGuideComplete =
    shopSettings["setup-guide-progress"]["init-setup-complete"];

  console.log("themeBlockId:", themeBlockId);

  // will be: shopSettings["setup-guide-progress"]["init-setup-complete"]
  const [showGuide, setShowGuide] = useState(true);

  function handleSetupProgressUpdates(itemName: keyof StoreSetupGuide) {
    if (!itemName) return;
    // ONE way updates for simplicity for now, false => true
    // This would typically update the backend, but for now we'll just log
    console.log(`Marking ${itemName} as complete`);
  }

  console.log(
    "shopSettings['setup-guide-progress']:",
    shopSettings["setup-guide-progress"],
  );

  /**
   * @info UI Data (NOT state, the id references our state object)
   */
  function initItemsArray() {
    const setupProgress = shopSettings["setup-guide-progress"];

    return [
      {
        id: 1,
        complete: setupProgress["upfile-app-bridge-embed"] || false,
        required: true,
        title:
          "Activate 'UpFile App Bridge' App Embed <strong>(required)</strong>",
        description:
          "Required for app functionality. Follow the link in a new tab and save",
        image: {
          url: "/app/images/app-bridge-graphic.svg",
          alt: "Click to activate the Upfile App Bridge App Embed",
        },
        // TODO: move the button into a buttons array, this would be for if/when we require MULTIPLE buttons per item in the Setup Guide. Would need to change how the props are applied in child components though of course
        buttonOptions: {
          buttonStyle: "primary" as const,
          content: "Activate app",
          props: {
            target: "_blank",
            url: `https://${shop}/admin/themes/current/editor?context=apps&template=body&activateAppId=${apiKey}/upfile-app-bridge-embed`,
            external: false,
          },
        },
        action: async () => {
          console.log("BUTTON CLICK TEST");
          try {
            const result = await pollForBlockActivation(
              mainTheme.id,
              "config/settings_data.json",
            );
            console.log("BLOCK ACTIVE!?", result);
            if (result) handleSetupProgressUpdates("upfile-app-bridge-embed");
          } catch (err) {
            console.warn(err instanceof Error ? err.message : String(err));
          }
        },
      },
      {
        id: 2,
        complete: setupProgress["upfile-theme-block"] || false,
        required: false,
        title:
          "Choose a location for the Upfile Theme Block <strong>(optional)</strong>",
        description: "Add UpFile as a theme block on a product template",
        image: {
          url: "/app/images/app-block-graphic.svg",
          alt: "Illustration showing an online storefront with a 'share' icon in top right corner",
        },
        action: () => console.log("copied store link!"),
        buttonOptions: {
          buttonStyle: "primary" as const,
          content: "Add block",
          props: {
            target: "_blank",
            url: `https://${shop}/admin/themes/current/editor?template=product&addAppBlockId=${themeBlockId}/upfile-theme-block&target=mainSection`,
            external: false,
          },
        },
      },
      {
        id: 3,
        complete: setupProgress["location-selected"] || false,
        required: false,
        title:
          "Or inject Upfile Into a Dynamic Surface  <strong>(optional)</strong>",
        description:
          "Inject UpFile into your theme cart-drawer or <a target='_blank' href='https://apps.shopify.com/upcart-cart-builder?search_id=1396b671-29a0-46ac-8afe-819cdff495b9&shallow_install_type=search&surface_detail=UpCart&surface_inter_position=1&surface_intra_position=1&surface_type=search'>a cart app</a>.",
        image: {
          url: "/app/images/injected-block-graphic.svg",
          alt: "Illustration showing an online storefront with a 'share' icon in top right corner",
        },
        action: () =>
          console.log("open up an input field to enter the parent selector"),
        buttonOptions: {
          buttonStyle: "primary" as const,
          content: "Inject block",
          props: {
            target: "_blank",
            url: `#`,
            external: false,
          },
        },
      },
      {
        id: 4,
        complete: setupProgress["plan-selected"] || false,
        required: false,
        title: "Select a plan! <strong>(required to go live)</strong>",
        description:
          "Select a plan to migrate to after your <strong>14 day free trial </strong> expires! (dev stores can remain on the basic plan indefinitely)",
        image: {
          url: "/app/images/paid-plan-graphic.svg",
          alt: "Plan selection illustration",
        },
        buttonOptions: {
          buttonStyle: "primary" as const,
          content: "Select a plan",
          props: {
            url: "/app/plan",
            external: false,
          },
        },
      },
    ];
  }

  const ITEMS = useMemo(initItemsArray, [
    mainTheme.id,
    shop,
    themeBlockId,
    apiKey,
  ]);

  // Example of step complete handler, adjust for your use case
  const onStepComplete = async (id: any) => {
    // API call to update completion state in DB, etc.
    await new Promise<void>((res) =>
      setTimeout(() => {
        res();
      }, 1000),
    );

    // setItems((prev) =>
    //   prev.map((item) =>
    //     item.id === id ? { ...item, complete: !item.complete } : item,
    //   ),
    // );
  };

  if (!showGuide)
    return <Button onClick={() => setShowGuide(true)}>Show Setup Guide</Button>;

  return (
    <Page>
      {/* This is the home, for news/updates and info */}
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
              // setItems(ITEMS); // This line was removed as per the edit hint
            }}
            onStepComplete={onStepComplete}
            items={ITEMS}
          />
        )}
      </BlockStack>
    </Page>
  );
}
