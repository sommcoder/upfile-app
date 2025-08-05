import {
  defineBlockSettingsObj,
  defineInjectionSettingsObj,
  defineWidgetSettingsObj,
  defineShopSettingsObj,
  deleteStoreDataDefinition,
  initCreateStoreData,
  getDefinitionByType,
} from "app/graphql/metadata";

import { fetchDataByGQLBody } from "app/helper/fetchDataByGQLBody";
import { logError } from "app/helper/logError";
import { rollbackTransactionSequence } from "app/util/rollbackTransactionSequence";

// module scoped, no worries about collisions:
const rollbackIds: string[] = [];

export async function createInitAppDefinitions(admin: any) {
  try {
    const injectionDef = await getOrCreateDefinition(
      admin,
      "upfile-injection-settings",
      defineInjectionSettingsObj,
    );

    const blockDef = await getOrCreateDefinition(
      admin,
      "upfile-block-settings",
      defineBlockSettingsObj,
    );

    const widgetDef = await getOrCreateDefinition(
      admin,
      "upfile-widget-settings",
      () => defineWidgetSettingsObj(injectionDef.id, blockDef.id),
    );

    const shopDef = await getOrCreateDefinition(
      admin,
      "upfile-shop-settings",
      () => defineShopSettingsObj(widgetDef.id),
    );

    console.log("shopDef:", shopDef);

    const result = await fetchDataByGQLBody(
      admin,
      initCreateStoreData(injectionDef, blockDef, widgetDef, shopDef),
    );
    console.log("initCreateStoreData result:", result);

    if (!result) throw new Error("Failed to create Store Data");

    return { injectionDef, blockDef, widgetDef, shopDef, updatedAt: "" };
  } catch (error) {
    // Important: rollbackIds already populated during definition creation
    try {
      await rollbackTransactionSequence(
        admin,
        rollbackIds,
        deleteStoreDataDefinition,
      );
    } catch (rollbackError) {
      logError("Rollback Failed: " + rollbackError);
    }

    logError(error);
    throw error; // propagate for higher-level error capture/logging
  }

  /* this is a common query handler function */
  async function getOrCreateDefinition(
    admin: any,
    type: string,
    createFn: () => GQL_BODY,
  ): Promise<MetaobjectDefinitionInfo> {
    const existing = await checkForTypeDefinition(admin, type);
    console.log("existing???:", existing);
    if (existing) {
      console.log(`Definition "${type}" already exists`);
      return existing;
    }

    console.log(`Definition "${type}" not found, creating...`);
    const createResult = await fetchDataByGQLBody(admin, createFn());
    console.log("getOrCreateDefinition() createResult:", createResult);
    const { def } = handleDefinitionData(createResult, type);
    return def;
  }

  function handleDefinitionData(
    data: {
      metaobjectDefinitionCreate: {
        metaobjectDefinition: MetaobjectDefinitionInfo;
        userErrors: any;
      };
    },
    type: string,
  ): { def: MetaobjectDefinitionInfo } {
    console.log("FETCH DATA:", data);
    const def = data?.metaobjectDefinitionCreate?.metaobjectDefinition;
    console.log("def CHECK:", def);
    if (!def) {
      const userErrors = data?.metaobjectDefinitionCreate?.userErrors ?? [];
      throw new Error(
        `handleDefinitionData() No definition for type: ${type}!\nUser Errors:\n${JSON.stringify(userErrors, null, 2)}`,
      );
    }
    rollbackIds.unshift(def.id);
    return { def };
  }

  async function checkForTypeDefinition(
    admin: any,
    type: string,
  ): Promise<MetaobjectDefinitionInfo | null> {
    const res = await fetchDataByGQLBody(admin, getDefinitionByType(type));
    console.log("Check Definition res:", res);

    return res?.metaobjectDefinitionByType ?? null;
  }
}

/*
 


      "nodes": [
        
          "id": "gid://shopify/MetaobjectDefinition/8957984953",
      
          "id": "gid://shopify/MetaobjectDefinition/8958017721",
       

          "gid://shopify/MetaobjectDefinition/8958050489",

          "gid://shopify/MetaobjectDefinition/8958083257",
 
*/
