import {
  Text,
  useBreakpoints,
  IndexTable,
  useIndexResourceState,
  Badge,
  Image,
} from "@shopify/polaris";
import type { IndexTableProps, IndexTableRowProps } from "@shopify/polaris";

import React from "react";

export default function ProductTable({ data }) {
  enum STATUS {
    active = "ACTIVE",
    archived = "ARCHIVED",
    draft = "DRAFT",
  }

  interface Product {
    id: string;
    title: string;
    status: STATUS;
    metafield: boolean;
    url: string | null;
  }

  interface ProductRow extends Product {
    position: number;
  }

  interface ProductGroup {
    id: string;
    position: number;
    products: ProductRow[];
  }

  interface Groups {
    [key: string]: ProductGroup;
  }

  const columnHeadings = [
    { id: "column-header--product", title: "Product/Variant" },
    {
      id: "column-header--enabled",
      title: "Widget Enabled",
      alignment: "end",
    },
  ];

  const groupRowsByGroupKey = (
    groupKey: keyof Product,
    resolveId: (groupVal: string) => string,
  ) => {
    let position = -1;

    const groups: Groups = data.reduce((groups: Groups, product: Product) => {
      const groupVal: string = product[groupKey] as string;

      if (!groups[groupVal]) {
        position += 1;

        groups[groupVal] = {
          position,
          products: [],
          id: resolveId(groupVal),
        };
      }

      groups[groupVal].products.push({
        ...product,
        position: position + 1,
      });

      position += 1;

      // console.log("groups:", groups);
      return groups;
    }, {});

    return groups;
  };

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(data as unknown as { [key: string]: unknown }[], {
      resourceFilter: ({ disabled }) => !disabled,
    });

  const groupedProducts = groupRowsByGroupKey(
    "title",
    (title) => `title--${title.toLowerCase()}`,
  );

  console.log("groupedProducts:", groupedProducts);
  const rowMarkup = Object.keys(groupedProducts).map((title, i) => {
    // TOP-LEVEL row keys:
    const { products, position, id: productId } = groupedProducts[title];

    let selected: IndexTableRowProps["selected"] = false;

    const someProductsSelected = products.some(({ id }) =>
      selectedResources.includes(id),
    );

    const allProductsSelected = products.every(({ id }) =>
      selectedResources.includes(id),
    );

    if (allProductsSelected) {
      selected = true;
    } else if (someProductsSelected) {
      selected = "indeterminate";
    }

    const selectableRows = data.filter(({ disabled }) => !disabled);

    const rowRange: IndexTableRowProps["selectionRange"] = [
      selectableRows.findIndex((row: ProductRow) => row.id === products[0].id),
      selectableRows.findIndex(
        (row: ProductRow) => row.id === products[products.length - 1].id,
      ),
    ];

    const disabled = products.every(({ disabled }) => disabled);

    return (
      <React.Fragment key={productId}>
        {/* Top-level rows: just id, position and products */}
        <IndexTable.Row
          // tone={"success"}
          rowType="data"
          selectionRange={rowRange}
          id={`Parent-${i}`}
          position={position}
          selected={selected}
          disabled={disabled}
          accessibilityLabel={`Select all products which have title ${title}`}
        >
          <IndexTable.Cell scope="col" id={productId}>
            <Text as="span" fontWeight="semibold">
              {title}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell scope="col" id={productId}></IndexTable.Cell>
          <IndexTable.Cell>
            <Text alignment="end" as="span">
              Dropzone Enabled?
            </Text>
          </IndexTable.Cell>
        </IndexTable.Row>
        {/* Sub-Rows, display the variant title in the cell text content */}
        {products.map(
          (
            { id, position, title, url, dropzoneEnabled, disabled },
            rowIndex,
          ) => (
            <IndexTable.Row
              rowType="child"
              key={rowIndex}
              id={id}
              position={position}
              selected={selectedResources.includes(id)}
              disabled={disabled}
            >
              <IndexTable.Cell
                scope="row"
                headers={`${columnHeadings[0].id} ${productId}`}
              >
                {title}
              </IndexTable.Cell>
              <IndexTable.Cell
                scope="row"
                headers={`${columnHeadings[0].id} ${productId}`}
              >
                {url ? (
                  <Image
                    source={url || ""}
                    height="40px"
                    width="40px"
                    alt="product image"
                  />
                ) : (
                  <Text as="span">No image</Text>
                )}
              </IndexTable.Cell>
              <IndexTable.Cell
                scope="row"
                headers={`${columnHeadings[0].id} ${productId}`}
              >
                <Text alignment="end" as="span">
                  <Badge>{dropzoneEnabled ? "true" : "false"}</Badge>
                </Text>
              </IndexTable.Cell>
            </IndexTable.Row>
          ),
        )}
      </React.Fragment>
    );
  });

  return (
    <IndexTable
      condensed={useBreakpoints().smDown}
      onSelectionChange={handleSelectionChange}
      selectedItemsCount={
        allResourcesSelected ? "All" : selectedResources.length
      }
      resourceName={resourceName}
      itemCount={data.length}
      headings={columnHeadings as IndexTableProps["headings"]}
    >
      {rowMarkup}
    </IndexTable>
  );
}
