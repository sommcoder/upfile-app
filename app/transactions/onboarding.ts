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
