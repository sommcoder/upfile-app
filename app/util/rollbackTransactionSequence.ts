import { logError } from "./logError";

/* I MAY only need a function like this for definition creation,, but maybe I could make this less narrow and work for all calls... essentially theis is fetchByGWLBody except iterating over a list of id's*/
export async function rollbackTransactionSequence(
  admin: any,
  ids: string[],
  rollbackQuery: any, // a function that rolls the transaction back
) {
  for (const id of ids) {
    const { query, variables } = rollbackQuery(id);
    const res = await admin.graphql(query, { variables });
    const json = await res.json();
    if (!json?.data?.metaobjectDefinitionDelete?.deletedId) {
      throw new Error(`Rollback failed for resource id: ${id}`);
    } else {
      console.log("Rolled back resource id:", id);
    }
  }
}
