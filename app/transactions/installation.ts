import {
  defineBlockSettingsObj,
  defineInjectionSettingsObj,
  defineWidgetSettingsObj,
  defineShopSettingsObj,
  deleteStoreDataDefinition,
  initCreateStoreData,
} from "app/graphql/metadata";

import { fetchDataByGQLBody } from "app/util/fetchDataByGQLBody";
import { logError } from "app/util/logError";
import { rollbackTransactionSequence } from "app/util/rollbackTransactionSequence";

// module scoped, no worries about collisions:
const rollbackIds: string[] = [];

export async function createInitAppDefinitions(admin: any) {
  try {
    const [injectionData, blockData] = await Promise.all([
      fetchDataByGQLBody(admin, defineInjectionSettingsObj()),
      fetchDataByGQLBody(admin, defineBlockSettingsObj()),
    ]);
    const { def: injectionDef } = handleDefinitionData(injectionData);
    const { def: blockDef } = handleDefinitionData(blockData);

    const { def: widgetDef } = handleDefinitionData(
      await fetchDataByGQLBody(
        admin,
        defineWidgetSettingsObj(injectionDef.id, blockDef.id),
      ),
    );
    const { def: shopDef } = handleDefinitionData(
      await fetchDataByGQLBody(admin, defineShopSettingsObj(widgetDef.id)),
    );
    const result = await fetchDataByGQLBody(
      admin,
      initCreateStoreData(injectionDef, blockDef, widgetDef, shopDef),
    );

    if (!result) throw new Error("failed to create Store Data()");

    return { injectionDef, blockDef, widgetDef, shopDef, updatedAt: "" };
  } catch (error) {
    await rollbackTransactionSequence(
      admin,
      rollbackIds,
      deleteStoreDataDefinition,
    );
    logError(error);
    // rethrow for logging at top-level
    throw error;
  }

  /* this is a common query handler function */
  function handleDefinitionData(data: {
    metaobjectDefinitionCreate: {
      metaobjectDefinition: MetaobjectDefinitionInfo;
      userErrors: any;
    };
  }): { def: MetaobjectDefinitionInfo } {
    console.log("FETCH DATA:", data);
    const def = data?.metaobjectDefinitionCreate?.metaobjectDefinition;

    if (!def) {
      const userErrors = data?.metaobjectDefinitionCreate?.userErrors ?? [];
      throw new Error(
        `handleDefinitionData() No definition!\nUser Errors:\n${JSON.stringify(userErrors, null, 2)}`,
      );
    }
    console.log("def:", def);
    rollbackIds.unshift(def.id);
    return { def };
  }
}
