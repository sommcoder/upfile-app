interface ValidBlock {
  blockType: string;
  blockId: string;
}

export function parseSettingsBodyContent(content: string) {
  try {
    const myAppExtensionId = process.env.SHOPIFY_THEME_APP_EXTENSION_ID || "";

    const blocksArr = extractDataFromThemeFileContent(
      content,
      myAppExtensionId,
    );

    // "shopify://apps/upfile-uploaded-file-orders/blocks/upfile-app-bridge-embed/e7359f9d-6ab4-41ee-8f7d-90f3a1478b01",
    return blocksArr;
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
    // This is fragile but seems to follow Shopify's current system!
    let jsonText: string | undefined;

    if (content.includes("*/")) {
      [, jsonText] = content.split("*/");
    } else {
      console.warn("Expected '*/' not found in content");
    }
    if (!jsonText) return []; // TODO: an error message here would be great!
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
