/**
 * @purpose uses the provided GQL body to make a GQL call.
 * we want the CALLER to handle the error.
 * ie: should RETHROW instead of SWALLOWING the error
 * if it fails, let the caller decide what to do!
 */
export async function fetchDataByGQLBody(
  admin: any,
  { query, variables }: GQL_BODY,
): Promise<any | undefined> {
  const res = await admin.graphql(query, { variables });
  const json = await res.json();
  if (!json?.data) {
    throw new Error("fetchDataByGQLBody() didn't receive any data!");
  }
  return json.data;
}
