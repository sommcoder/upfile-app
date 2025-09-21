import {
  BlockStack,
  Card,
  InlineStack,
  Layout,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
} from "@shopify/polaris";

export function SkeletonPageComponent() {
  return (
    <SkeletonPage primaryAction>
      <Layout>
        <Layout.Section>
          <BlockStack gap={"400"}>
            <Card>
              <SkeletonBodyText />
            </Card>
            <Card>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText />
            </Card>
            <Card>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText />
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}
