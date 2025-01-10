import {
  Avatar,
  Button,
  Card,
  Filters,
  Page,
  ResourceItem,
  ResourceList,
  Text,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import type { ResourceListProps } from "@shopify/polaris";
import { useState, useCallback } from "react";

export async function action({ req, res }: { req: Request; res: Response }) {
  return null;
}

export async function loader() {
  return null;
}

export default function OrdersPage() {
  const [selectedItems, setSelectedItems] = useState<
    ResourceListProps["selectedItems"]
  >([]);
  const [sortValue, setSortValue] = useState("DATE_MODIFIED_DESC");
  const [taggedWith, setTaggedWith] = useState<string | undefined>("VIP");
  const [queryValue, setQueryValue] = useState<string | undefined>(undefined);

  const handleTaggedWithChange = useCallback(
    (value: string) => setTaggedWith(value),
    [],
  );
  const handleQueryValueChange = useCallback(
    (value: string) => setQueryValue(value),
    [],
  );
  const handleTaggedWithRemove = useCallback(
    () => setTaggedWith(undefined),
    [],
  );
  const handleQueryValueRemove = useCallback(
    () => setQueryValue(undefined),
    [],
  );
  const handleClearAll = useCallback(() => {
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [handleQueryValueRemove, handleTaggedWithRemove]);

  const resourceName = {
    singular: "customer",
    plural: "customers",
  };

  const items = [
    {
      id: "112",
      url: "#",
      name: "Mae Jemison",
      location: "Decatur, USA",
      latestOrderUrl: "orders/1456",
    },
    {
      id: "212",
      url: "#",
      name: "Ellen Ochoa",
      location: "Los Angeles, USA",
      latestOrderUrl: "orders/1457",
    },
  ];

  const promotedBulkActions = [
    {
      content: "Edit customers",
      onAction: () => console.log("Todo: implement bulk edit"),
    },
  ];

  const bulkActions = [
    {
      content: "Add tags",
      onAction: () => console.log("Todo: implement bulk add tags"),
    },
    {
      content: "Remove tags",
      onAction: () => console.log("Todo: implement bulk remove tags"),
    },
    {
      content: "Delete customers",
      onAction: () => console.log("Todo: implement bulk delete"),
    },
  ];

  const filters = [
    {
      key: "taggedWith3",
      label: "Tagged with",
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters =
    taggedWith && !isEmpty(taggedWith)
      ? [
          {
            key: "taggedWith3",
            label: disambiguateLabel("taggedWith3", taggedWith),
            onRemove: handleTaggedWithRemove,
          },
        ]
      : [];

  const filterControl = (
    <Filters
      queryValue={queryValue}
      filters={filters}
      appliedFilters={appliedFilters}
      onQueryChange={handleQueryValueChange}
      onQueryClear={handleQueryValueRemove}
      onClearAll={handleClearAll}
    >
      <div style={{ paddingLeft: "8px" }}>
        <Button onClick={() => console.log("New filter saved")}>Save</Button>
      </div>
    </Filters>
  );

  return (
    <Page>
      <TitleBar title="Orders" />
      <Card>
        A list of all orders that have a corresponding file associated with them{" "}
        <br />
        Users should: <br />
        - be able to inspect orders <br />
        - link to the clicked order <br />- perhaps see a thumbnail of the file
        if its an image type file - if not perhaps some sort of file type
        placeholder will do - clicking on the file should allow the merchant to
        view the file.. not sure what that would entail, perhaps AppBridge has a
        component?
      </Card>
      <Card>
        <ResourceList
          resourceName={resourceName}
          items={items}
          renderItem={renderItem}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          promotedBulkActions={promotedBulkActions}
          bulkActions={bulkActions}
          sortValue={sortValue}
          sortOptions={[
            { label: "Newest update", value: "DATE_MODIFIED_DESC" },
            { label: "Oldest update", value: "DATE_MODIFIED_ASC" },
          ]}
          onSortChange={(selected) => {
            setSortValue(selected);
            console.log(`Sort option changed to ${selected}.`);
          }}
          filterControl={filterControl}
        />
      </Card>
    </Page>
  );
}

// type items = TItemType[];

function renderItem(item: (typeof items)[number]) {
  const { id, url, name, location, latestOrderUrl } = item;

  // TODO: looks like we may just need to change this media to the LOCATION of the media file which should be saved on our app, however it may be best to ALSO store it in the merchants /Content/Files folder
  const media = <Avatar customer size="md" name={name} />;
  const shortcutActions = latestOrderUrl
    ? [{ content: "View latest order", url: latestOrderUrl }]
    : undefined;
  return (
    <ResourceItem
      id={id}
      url={url}
      media={media}
      accessibilityLabel={`View details for ${name}`}
      shortcutActions={shortcutActions}
      persistActions
    >
      <Text as="h3">{name}</Text>
      <div>{location}</div>
    </ResourceItem>
  );
}

function disambiguateLabel(key: string, value: string): string {
  switch (key) {
    case "taggedWith3":
      return `Tagged with ${value}`;
    default:
      return value;
  }
}

function isEmpty(value: string): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  } else {
    return value === "" || value == null;
  }
}
