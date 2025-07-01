import {
  defineBlockSettings,
  defineInjectionSettings,
  defineWidgetSettings,
  defineShopSettings,
} from "app/graphql/metadata";

export function initDataDefinitionTransaction() {
  defineBlockSettings();
  defineInjectionSettings();
  defineWidgetSettings();
  defineShopSettings();
}

export async function initDataPopulationTransaction() {
  /*
   DATA POPULATION for DEFAULT DATA:

  defineBlockSettings();
  defineInjectionSettings();
  defineWidgetSettings();
  defineShopSettings();
   
  */
}
