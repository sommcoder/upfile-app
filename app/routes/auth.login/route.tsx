import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { login } from "../../shopify.server";

import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors, polarisTranslations };
};

/*
 
This is only used if someone tries to access that isn't already authenticated
 
*/
export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <PolarisAppProvider i18n={loaderData.polarisTranslations}>
      <Page>
        <Card>
          <Form method="post">
            <FormLayout>
              <Text variant="headingMd" as="h2">
                Log in
              </Text>
              <TextField
                type="text"
                name="shop"
                label="Shop domain"
                helpText="example.myshopify.com"
                value={shop}
                onChange={setShop}
                autoComplete="on"
                error={errors.shop}
              />
              <Button submit>Log in</Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}

/*
TODO: this is the script that checks if the merchant's theme can support app blocks
// Specify the name of the template that the app will integrate with
const APP_BLOCK_TEMPLATES = ["product", "collection", "index"];
const getMainThemeId = `
query getMainThemeId {
  themes(first: 1, roles: [MAIN]) {
    nodes {
      id
    }
  }
}`;

let response = await client.request(getMainThemeId);
const themeId = response.data.themes.nodes[0].id;

// Retrieve the JSON templates that we want to integrate with
const getFilesQuery = `
query getFiles($filenames: [String!]!, $themeId: ID!) {
  theme(id: $themeId) {
    files(filenames: $filenames) {
      nodes {
        filename
        body {
        ... on OnlineStoreThemeFileBodyText { content }
        ... on OnlineStoreThemeFileBodyBase64 { contentBase64 }
        }
      }
    }
  }
}
`;

response = await client.request(getFilesQuery, {
  variables: {
    themeId: themeId,
    filenames: APP_BLOCK_TEMPLATES.map((f) => `templates/${f}.json`),
  },
});

const jsonTemplateFiles = response.data.theme.files.nodes;
if (
  jsonTemplateFiles.length > 0 &&
  jsonTemplateFiles.length === APP_BLOCK_TEMPLATES.length
) {
  console.log("All desired templates support sections everywhere!");
} else if (jsonTemplateFiles.length) {
  console.log(
    "Only some of the desired templates support sections everywhere.",
  );
}
const jsonTemplateData = jsonTemplateFiles.map((file) => {
  return { filename: file.filename, body: jsonc_parse(file.body.content) };
});

// Retrieve the body of JSON templates and find what section is set as `main`
const templateMainSections = jsonTemplateData
  .map((file) => {
    const main = Object.entries(file.body.sections).find(
      ([id, section]) => id === "main" || section.type.startsWith("main-"),
    );
    if (main) {
      return "sections/" + main[1].type + ".liquid";
    }
  })
  .filter((section) => section);

const sectionFiles = await client.request(getFilesQuery, {
  variables: { themeId: themeId, filenames: templateMainSections },
});

const sectionsWithAppBlock = sectionFiles.data.theme.files.nodes
  .map((file) => {
    let acceptsAppBlock = false;
    const match = file.body.content.match(
      /\{\%\s+schema\s+\%\}([\s\S]*?)\{\%\s+endschema\s+\%\}/m,
    );
    const schema = jsonc_parse(match[1]);
    if (schema && schema.blocks) {
      acceptsAppBlock = schema.blocks.some((b) => b.type === "@app");
    }
    return acceptsAppBlock ? file : null;
  })
  .filter((section) => section);

if (
  jsonTemplateData.length > 0 &&
  jsonTemplateData.length === sectionsWithAppBlock.length
) {
  console.log(
    "All desired templates have main sections that support app blocks!",
  );
} else if (sectionsWithAppBlock.length) {
  console.log("Only some of the desired templates support app blocks.");
} else {
  console.log("None of the desired templates support app blocks");
} 
*/
