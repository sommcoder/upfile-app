export const loader: LoaderFunction = async ({ request }) => {
  if (!request || !request.body) return null;

  console.log("request:", request);
  const { session } = await authenticate.public.appProxy(request);

  if (!session) return new Response("Unauthorized", { status: 401 });

  // GET requests go here!
  return null;
};
