export async function createStorefrontAccessToken(
  shop: string,
  adminAccessToken: string,
) {
  const res = await fetch(
    `https://${shop}/admin/api/2023-10/storefront_access_tokens.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminAccessToken,
      },
      body: JSON.stringify({
        storefront_access_token: {
          title: "Upfile App Token",
        },
      }),
    },
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Storefront token creation failed: ${error}`);
  }

  const { storefront_access_token } = await res.json();
  const token = storefront_access_token.access_token;
  console.log("token:", token);
  // Store this in your DB by `shop` domain
  // await saveStorefrontToken(shop, token);
}
