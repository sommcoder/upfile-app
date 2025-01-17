import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page, Card, Banner, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { FeedbackCard } from "app/components/Feedback/FeedbackCard";
import { SetupGuide } from "app/components/SetupGuide/SetupGuide";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  /* 
  in a Remix loader, we often want to:
  1) authenticate the request
  2) return the data
  3) useLoaderData in the UI Component to GET the data and then render it however you want there
  4) if slow, you can use defer in your loader which will wait until the UI is rendered before it runs your loader code.

  import defer

  return defer(
  { your data }
  );

  use a <Suspense fallback={<Skeleton/>}>
  
  */

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return null;
};

export default function Index() {
  const [showGuide, setShowGuide] = useState(true);
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
          This app is free to test while the store is under development. Once
          the store switches over to a paid Shopify plan you will need to return
          to this dashboard and authorize billing to continue using this app.
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

const ITEMS = [
  {
    id: 0,
    title: "Add a dropzone block to your first product",
    description:
      "If checking out takes longer than 30 seconds, half of all shoppers quit. Let your customers check out quickly with a one-step payment solution.",
    image: {
      url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/shop_pay_task-70830ae12d3f01fed1da23e607dc58bc726325144c29f96c949baca598ee3ef6.svg",
      alt: "Illustration highlighting ShopPay integration",
    },
    complete: false,
    primaryButton: {
      content: "Add product",
      props: {
        url: "https://www.example.com",
        external: true,
      },
    },
    secondaryButton: {
      content: "Import products",
      props: {
        url: "https://www.example.com",
        external: true,
      },
    },
  },
  {
    id: 1,
    title: "Share your online store",
    description:
      "Drive awareness and traffic by sharing your store via SMS and email with your closest network, and on communities like Instagram, TikTok, Facebook, and Reddit.",
    image: {
      url: "https://cdn.shopify.com/shopifycloud/shopify/assets/admin/home/onboarding/detail-images/home-onboard-share-store-b265242552d9ed38399455a5e4472c147e421cb43d72a0db26d2943b55bdb307.svg",
      alt: "Illustration showing an online storefront with a 'share' icon in top right corner",
    },
    complete: false,
    primaryButton: {
      content: "Copy store link",
      props: {
        onAction: () => console.log("copied store link!"),
      },
    },
  },
  {
    id: 2,
    title: "Translate your store",
    description:
      "Translating your store improves cross-border conversion by an average of 13%. Add languages for your top customer regions for localized browsing, notifications, and checkout.",
    image: {
      url: "https://cdn.shopify.com/b/shopify-guidance-dashboard-public/nqjyaxwdnkg722ml73r6dmci3cpn.svgz",
    },
    complete: false,
    primaryButton: {
      content: "Add a language",
      props: {
        url: "https://www.example.com",
        external: true,
      },
    },
  },
];
