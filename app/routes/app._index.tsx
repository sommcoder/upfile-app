import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page, Card, Banner, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { FeedbackCard } from "app/components/Feedback/FeedbackCard";
import { SetupGuide } from "app/components/SetupGuide/SetupGuide";
import { useState } from "react";
import { authenticate } from "app/shopify.server";
import { useLoaderData } from "@remix-run/react";

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

  return session.shop;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return null;
};

export default function Index() {
  const shop = useLoaderData();
  console.log("shop:", shop);
  const [showGuide, setShowGuide] = useState(true);

  const ITEMS = [
    {
      id: 0,
      title: "Activate Upfile App Bridge",
      description:
        "You can then choose to add Upfile as a theme block to a template, ",
      image: {
        url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/shop_pay_task-70830ae12d3f01fed1da23e607dc58bc726325144c29f96c949baca598ee3ef6.svg",
        alt: "Illustration highlighting ShopPay integration",
      },
      complete: false,
      primaryButton: {
        content: "Activate",
        props: {
          url: `https://${shop}/admin/themes/current/editor?apps&template=product&activateAppId=${process.env.UPFILE_APP_ID}`,
          external: false,
          onAction: () => console.log("copied store link!"),
        },
      },
    },
    {
      id: 1,
      title: "Choose a location for the Upfile Block",
      description:
        "You can simply add it as an app block onto a product, page or cart template. You can even inject it into dynamic cart drawers!",
      image: {
        url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/detail-images/home-onboard-share-store-b265242552d9ed38399455a5e4472c147e421cb43d72a0db26d2943b55bdb307.svg",
        alt: "Illustration showing an online storefront with a 'share' icon in top right corner",
      },
      complete: false,
      primaryButton: {
        content: "Add Theme Block",
        props: {
          url: `https://${shop}/admin/themes/current/editor`,
          external: false,
          onAction: () => console.log("copied store link!"),
        },
      },
      secondaryButton: {
        content: "Add to Cart Drawer",
        props: {
          url: "/app/settings",
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
  const onStepComplete = async (id) => {
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
