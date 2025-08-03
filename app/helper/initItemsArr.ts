/**
 * @info UI Data (NOT state, the id references our state object)
 */
export function initItemsArray(
  shop: string,
  apiKey: string,
  themeBlockId: string,
  mainTheme: string,
) {
  return [
    {
      id: "upfile-app-bridge-embed", // references the state object
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
        buttonStyle: "primary",
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
          console.warn(err.message);
        }
      },
    },
    {
      id: "upfile-theme-block",
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
        buttonStyle: "primary",
        content: "Add block",
        props: {
          target: "_blank",
          url: `https://${shop}/admin/themes/current/editor?template=product&addAppBlockId=${themeBlockId}/upfile-theme-block&target=mainSection`,
          external: false,
        },
      },
    },
    {
      id: "location-selected",
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
        buttonStyle: "primary",
        content: "Inject block",
        props: {
          target: "_blank",
          url: `#`,
          external: false,
        },
      },
    },
    {
      id: "plan-selected",
      required: false,
      title: "Select a plan! <strong>(required to go live)</strong>",
      description:
        "Select a plan to migrate to after your <strong>14 day free trial </strong> expires! (dev stores can remain on the basic plan indefinitely)",
      image: {
        url: "/app/images/paid-plan-graphic.svg",
        alt: "Plan selection illustration",
      },
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
}
