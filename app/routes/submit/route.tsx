import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

/* 
json:
@deprecated
This utility is deprecated in favor of opting into Single Fetch via future.v3_singleFetch and returning raw objects. This method will be removed in React Router v7. If you need to return a JSON res, you can use res.json().
*/

// How do we do server routing and expose endpoints with Remix?

/* 
- I understand that the file name dictates the endpoint.. like this one should be something like: host.com/submit



TODO: Update your App URL and Allowed redirection URL(s) in the Shopify Partner Dashboard to include the endpoint.

*/
export async function action({ req, res }: { req: Request; res: Response }) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  console.log("/submit, req.body:", req.body);

  const formData = await req.formData();
  const userInput = formData.get("userInput");

  if (!userInput) {
    return json({ error: "Input is required" }, { status: 400 });
  }

  console.log("User Input:", userInput);

  // Process the input (e.g., save to database or send to another API)
  return json({ success: true, message: "Submission received" });
}

export async function loader() {
  const data = { message: "Hello from the loader!" };
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export default function MyComponent() {
  const { message } = useLoaderData<typeof loader>();
  console.log("message:", message);
  return <div>{message}</div>;
}
