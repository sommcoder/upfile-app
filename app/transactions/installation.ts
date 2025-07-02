import {
  defineBlockSettings,
  defineInjectionSettings,
  defineWidgetSettings,
  defineShopSettings,
  deleteStoreDataDefinition,
} from "app/graphql/metadata";

export async function resolveAppDefinitions(admin: any) {
  const createdIds: string[] = [];

  try {
    // Step 1: Define independent base/leaf nodes
    const [injectionId, blockId] = await Promise.all([
      fetchCreateMetaDef(admin, defineInjectionSettings(), createdIds),
      fetchCreateMetaDef(admin, defineBlockSettings(), createdIds),
    ]);

    // Step 2: Create widget definition using previous IDs
    const widgetId = await fetchCreateMetaDef(
      admin,
      defineWidgetSettings(injectionId, blockId),
      createdIds,
    );

    // Step 3: Create shop settings using widget ID
    const shopId = await fetchCreateMetaDef(
      admin,
      defineShopSettings(widgetId),
      createdIds,
    );

    return { injectionId, blockId, widgetId, shopId };
  } catch (err) {
    console.error("Rolling back due to error:", err);
    await rollbackDefinitionCreation(admin, createdIds.reverse());
    throw err;
  }
}

async function fetchCreateMetaDef(
  admin: any,
  definitionObj: GQL_BODY,
  createdIds: string[],
) {
  const { query, variables } = definitionObj;
  const res = await admin.graphql(query, { variables });
  const json = await res.json();

  const id = json?.data?.metaobjectDefinitionCreate?.metaobjectDefinition?.id;

  if (!id) {
    throw new Error(
      "Metaobject creation failed:\n" + JSON.stringify(json, null, 2),
    );
  }

  createdIds.push(id);
  return id;
}

async function rollbackDefinitionCreation(admin: any, ids: string[]) {
  for (const id of ids) {
    const { query, variables } = deleteStoreDataDefinition(id);
    const res = await admin.graphql(query, { variables });
    const json = await res.json();
    if (!json?.data?.metaobjectDefinitionDelete?.deletedId) {
      console.warn("Rollback failed for:", id, json);
    } else {
      console.log("Rolled back:", id);
    }
  }
}
