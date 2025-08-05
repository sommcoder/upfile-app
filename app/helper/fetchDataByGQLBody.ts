/**
 * @purpose a helper that uses the provided GQL body to make a GQL call.
 * converts the response into json and returns the json data
 * @param admin the Remix authenticated admin API helper
 * @errors we want the CALLER to handle the error.
 * @returns the serialized data or undefined for error handling
 * if the query fails, let the caller decide what to do with the error
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
