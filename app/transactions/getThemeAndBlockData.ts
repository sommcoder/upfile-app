import { getSettingsData, getStoreThemeList } from "app/graphql/theme";
import { fetchDataByGQLBody } from "app/util/fetchDataByGQLBody";

export async function getThemeAndBlockData(admin: any) {
  try {
    const data = await fetchDataByGQLBody(admin, getStoreThemeList(20));

    console.log("data:", data);
    if (!data) {
      throw new Error("no theme data");
    }

    // parse out the main theme:
    const mainTheme = parseOutMainTheme(data.themes.nodes);
    console.log("mainTheme:", mainTheme);

    // get settings from main theme:
    const mainThemeConfigSettings = await fetchDataByGQLBody(
      admin,
      getSettingsData(mainTheme.id, "config/settings_data.json"),
    );

    // TODO should also traverse main.product and cart
    // upfile_uploaded_file_orders_upfile_theme_block
    const mainThemeProductSettings = await fetchDataByGQLBody(
      admin,
      getSettingsData(mainTheme.id, "templates/product.json"),
    );

    // get the body content
    const blocksArr = parseSettingsBodyContent([
      mainThemeConfigSettings.theme.files.nodes[0].body.content,
      mainThemeProductSettings.theme.files.nodes[0].body.content,
    ]);

    console.log("blocksArr:", blocksArr);

    return {
      mainTheme: mainTheme,
      blocks: blocksArr,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.log("getThemeAndBlockData msg:", error.message);
    } else {
      console.log("getThemeAndBlockData error:", error);
    }
  }
}

function parseOutMainTheme(themeNodes: any[]) {
  return themeNodes.find((theme) => theme.role === "MAIN");
}

// function parse

function parseSettingsBodyContent(...content: string[]) {
  try {
    const validAppBlocksArr: { blockType: string; blockId: string }[] = [];

    // TODO: traverse the array of string content FIRST

    // Remove the multiline comment at the top
    const [, jsonText] = content.split("*/");
    const jsonWithoutComments = jsonText.trim();
    const {
      current: { blocks: blockObj },
    } = JSON.parse(jsonWithoutComments);

    const myAppExtensionId = process.env.SHOPIFY_THEME_APP_EXTENSION_ID || "";

    Object.keys(blockObj).forEach((blockKey) => {
      const blockType = blockObj[blockKey].type || "";
      console.log("blockType:", blockType);
      if (blockType.includes(myAppExtensionId)) {
        validAppBlocksArr.push({ blockId: blockKey, blockType: blockType });
        console.log(
          `Found matching block! Block ID: ${blockKey}, Type: ${blockType}`,
        );
      }
    });

    console.log("validAppBlocksArr:", validAppBlocksArr);

    //  "shopify://apps/upfile-uploaded-file-orders/blocks/upfile-app-bridge-embed/e7359f9d-6ab4-41ee-8f7d-90f3a1478b01",
    return validAppBlocksArr;
  } catch (error) {
    if (error instanceof Error) {
      console.log("parseSettingsBodyContent msg:", error.message);
    } else {
      console.log("parseSettingsBodyContent error:", error);
    }
  }
}
