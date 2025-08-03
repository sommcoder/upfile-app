import { getStoreMainTheme } from "app/graphql/theme";
import { fetchDataByGQLBody } from "app/helper/fetchDataByGQLBody";

// maybe this gets adjusted to include the file name we're searching for?
export async function getMainThemeContent(admin: any) {
  const data = await fetchDataByGQLBody(admin, getStoreMainTheme());

  console.log("data:", data);
  if (!data) {
    throw new Error("no theme data");
  }

  // parse out the main theme:
  const mainTheme = parseOutMainTheme(data.themes.nodes);
  console.log("mainTheme:", mainTheme);

  if (!mainTheme) {
    throw new Error("no theme data");
  }

  return {
    mainTheme: mainTheme,
  };
}

function parseOutMainTheme(themeNodes: any[]) {
  return themeNodes.find((theme) => theme.role === "MAIN");
}

// function parse

interface ValidBlock {
  blockType: string;
  blockId: string;
}

function parseSettingsBodyContent(
  configContent: string,
  productContent: string,
) {
  try {
    const myAppExtensionId = process.env.SHOPIFY_THEME_APP_EXTENSION_ID || "";

    // config is for the app embed!
    const configBlocksArr = extractDataFromThemeFileContent(
      configContent,
      myAppExtensionId,
    );

    // products are only if they choose product
    const productBlocksArr = extractDataFromThemeFileContent(
      productContent,
      myAppExtensionId,
    );

    console.log("configBlocksArr:", configBlocksArr);
    console.log("productBlocksArr:", productBlocksArr);

    // "shopify://apps/upfile-uploaded-file-orders/blocks/upfile-app-bridge-embed/e7359f9d-6ab4-41ee-8f7d-90f3a1478b01",
    return [...(configBlocksArr ?? []), ...(productBlocksArr ?? [])];
  } catch (error) {
    if (error instanceof Error) {
      console.log("parseSettingsBodyContent msg:", error.message);
    } else {
      console.log("parseSettingsBodyContent error:", error);
    }
  }
}

interface ValidBlock {
  blockId: string;
  disabled: boolean;
  blockType: string;
}

/**
 * Extracts valid app blocks (matching your app extension ID)
 * from the Shopify theme file content.
 *
 * @param content Raw theme file string (with leading comment)
 * @param myAppExtensionId The app extension ID to match in block `type`
 * @returns Array of matching blocks with id, disabled flag, and type
 */
export function extractDataFromThemeFileContent(
  content: string,
  myAppExtensionId: string,
): ValidBlock[] {
  const results: ValidBlock[] = [];

  try {
    // Strip the auto-generated multiline comment at the top
    const [, jsonText] = content.split("*/");
    const jsonWithoutComments = jsonText.trim();
    const parsed = JSON.parse(jsonWithoutComments);

    // Look for blocks object (support both config + template structure)
    const blockObj = parsed?.current?.blocks ?? parsed?.blocks;
    if (!blockObj || typeof blockObj !== "object") return [];

    Object.entries(blockObj).forEach(([blockId, blockData]: [string, any]) => {
      const blockType = blockData?.type;
      if (
        typeof blockType === "string" &&
        blockType.includes(myAppExtensionId)
      ) {
        results.push({
          blockId,
          disabled: Boolean(blockData.disabled),
          blockType,
        });
      }
    });
  } catch (err) {
    console.error("extractValidBlocksFromThemeFileContent error:", err);
  }

  return results;
}
