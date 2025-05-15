import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page, Card, Banner, Button } from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { FeedbackCard } from "app/components/Feedback/FeedbackCard";
import { SetupGuide } from "app/components/SetupGuide/SetupGuide";
import { useContext, useState } from "react";
import { authenticate } from "app/shopify.server";
import { useLoaderData } from "@remix-run/react";
import { useEnv } from "app/context/envcontext";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!session) return null;
  console.log("session:", session);

  // const response = await fetch(
  //   `https://${session.shop}/admin/api/2024-01/themes.json`,
  // );
  // console.log("response:", response);
  // if (!response.ok) {
  //   throw new Error("could not fetch installed theme");
  // }
  // const data = await response.json();
  // const publishedTheme = data.themes.find(
  //   (theme: any) => theme.role === "main",
  // );
  // console.log("publishedTheme:", publishedTheme);

  return session?.shop;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return null;
};

export default function Index() {
  const shop = useLoaderData();
  const { embedAppId, apiKey } = useEnv();

  console.log("embedAppId:", embedAppId);
  const [showGuide, setShowGuide] = useState(true);
  // const ITEMS = [];
  const ITEMS = [
    {
      id: 0,
      title: "Activate Upfile App Bridge",
      description: "The Upfile app bridge is required for this app to function",
      image: {
        url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/shop_pay_task-70830ae12d3f01fed1da23e607dc58bc726325144c29f96c949baca598ee3ef6.svg",
        alt: "Illustration highlighting ShopPay integration",
      },
      // app block:
      // https://<myshopifyDomain>/admin/themes/current/editor?template=${template}&addAppBlockId={api_key}/{handle}&target=newAppsSection

      // App embed:
      // https://<myshopifyDomain>/admin/themes/current/editor?context=apps&template=${template}&activateAppId={api_key}/{handle}
      complete: false,
      primaryButton: {
        content: "Activate",
        props: {
          target: "_blank",
          url: `https://${shop}/admin/themes/current/editor?context=apps&template=body&activateAppId=${apiKey}/upfile-bridge`,
          external: false,
          onAction: () => console.log("copied store link!"),
        },
      },
    },
    {
      id: 1,
      title: "Choose a location for the Upfile Block",
      description:
        "You can add Upfile as a block in product or cart or inject it dynamically into a theme cart-drawer or 3rd party cart app. ",
      image: {
        url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/detail-images/home-onboard-share-store-b265242552d9ed38399455a5e4472c147e421cb43d72a0db26d2943b55bdb307.svg",
        alt: "Illustration showing an online storefront with a 'share' icon in top right corner",
      },

      // apparently this can be done automatically through the theme code?
      /*
     
    "blocks": {
      "unique-app-handle": {
        "type": "shopify://apps/unique-app-handle/blocks/app-embed/unique-id",
        "disabled": false,
        "settings": {
        }
      }
    },
     
    */
      // target=mainSection seems to work to add to the product/main but for some reason its adding a different app....?
      //  The default state in Safari for the “Prevent cross-site tracking” option is enabled.
      complete: false,
      primaryButton: {
        content: "Add to /product",
        props: {
          target: "_blank",
          url: `https://${shop}/admin/themes/current/editor?template=product&addAppBlockId=${apiKey}/upfile-app-block&target=mainSection`,
          external: false,
          onAction: () => console.log("copied store link!"),
        },
      },
      secondaryButton: {
        content: "Add to /cart",
        props: {
          url: `https://${shop}/admin/themes/current/editor?template=product&addAppBlockId=${apiKey}/upfile-app-block&target=cart`,
          external: false,
        },
      },
      tertiaryButton: {
        content: "Inject into /cart-drawer",
        props: {
          url: `https://${shop}/admin/themes/current/editor?context=apps&template=body&activateAppId=${apiKey}/upfile-bridge`,
          external: false,
        },
      },
      quaternaryButton: {
        content: "Inject into cart app",
        props: {
          url: `https://${shop}/admin/themes/current/editor?context=apps&template=body&activateAppId=${apiKey}/upfile-bridge`,
          external: false,
        },
      },
    },
    {
      id: 2,
      title: "Select your plan!",
      description:
        "Select a plan for after your 14 day free trial expires! (dev stores are exempt)",
      image: {
        url: "https://cdn.shopify.com/b/shopify-guidance-dashboard-public/nqjyaxwdnkg722ml73r6dmci3cpn.svgz",
      },
      complete: false,
      primaryButton: {
        content: "Add a plan",
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
    try {
      // API call to update completion state in DB, etc.
      await new Promise((res) =>
        setTimeout(() => {
          res();
        }, [1000]),
      );

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, complete: !item.complete } : item,
        ),
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (!showGuide)
    return <Button onClick={() => setShowGuide(true)}>Show Setup Guide</Button>;

  return (
    <Page>
      <TitleBar title="File Dropzone Uploader"></TitleBar>
      <Banner title="Notice for Developers" onDismiss={() => {}}>
        <p>
          This app is free to test while the store is under development. <br />
          Once the store switches over to a paid Shopify plan you will need to
          return to this dashboard and authorize billing to continue using this
          app.
        </p>
      </Banner>
      <SetupGuide
        onDismiss={() => {
          setShowGuide(false);
          setItems(ITEMS);
        }}
        onStepComplete={onStepComplete}
        items={items}
      />
      <FeedbackCard />
    </Page>
  );
}
