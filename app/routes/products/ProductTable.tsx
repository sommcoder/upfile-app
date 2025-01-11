import {
  Text,
  useBreakpoints,
  IndexTable,
  useIndexResourceState,
  Badge,
} from "@shopify/polaris";
import type { IndexTableProps, IndexTableRowProps } from "@shopify/polaris";

import React from "react";

export default function ProductTable() {
  interface Product {
    id: string;
    name: string;
    hasWidget: boolean;
    size?: string;
    image?: string;
    disabled?: boolean;
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

  const rows: Product[] = [
    {
      id: "3411",
      name: "Orange",
      size: "small",
      hasWidget: true,
    },
    {
      id: "2562",
      name: "Orange",
      hasWidget: true,
      size: "medium",
    },
    {
      id: "4102",
      name: "Orange",
      hasWidget: false,
      size: "large",
    },
    {
      id: "2564",
      name: "Red",
      hasWidget: false,
      disabled: true,
    },
    {
      id: "2563",
      hasWidget: false,
      name: "Green",
    },
  ];

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

    const groups: Groups = rows.reduce((groups: Groups, product: Product) => {
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

      console.log("groups:", groups);
      return groups;
    }, {});

    return groups;
  };

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(rows as unknown as { [key: string]: unknown }[], {
      resourceFilter: ({ disabled }) => !disabled,
    });

  const groupedProducts = groupRowsByGroupKey(
    "name",
    (name) => `name--${name.toLowerCase()}`,
  );

  const rowMarkup = Object.keys(groupedProducts).map(
    (name, hasWidget, index) => {
      const { products, position, id: productId } = groupedProducts[name];

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

      const selectableRows = rows.filter(({ disabled }) => !disabled);

      const rowRange: IndexTableRowProps["selectionRange"] = [
        selectableRows.findIndex((row) => row.id === products[0].id),
        selectableRows.findIndex(
          (row) => row.id === products[products.length - 1].id,
        ),
      ];

      const disabled = products.every(({ disabled }) => disabled);

      return (
        <React.Fragment key={productId}>
          {/* Primary Row */}
          <IndexTable.Row
            // tone={"success"}
            rowType="data"
            selectionRange={rowRange}
            id={`Parent-${index}`}
            position={position}
            selected={selected}
            disabled={disabled}
            accessibilityLabel={`Select all products which have name ${name}`}
          >
            <IndexTable.Cell scope="col" id={productId}>
              <Text as="span" fontWeight="semibold">
                {name}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text alignment="end" as="span">
                <Badge>{hasWidget ? "true" : "false"}</Badge>
              </Text>
            </IndexTable.Cell>
          </IndexTable.Row>
          {/* Sub Rows, display the variant name in the cell text content */}
          {products.map(
            ({ id, position, size, hasWidget, disabled }, rowIndex) => (
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
                  {size}
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text alignment="end" as="span">
                    <Badge>{hasWidget ? "true" : "false"}</Badge>
                  </Text>
                </IndexTable.Cell>
              </IndexTable.Row>
            ),
          )}
        </React.Fragment>
      );
    },
  );

  return (
    <IndexTable
      condensed={useBreakpoints().smDown}
      onSelectionChange={handleSelectionChange}
      selectedItemsCount={
        allResourcesSelected ? "All" : selectedResources.length
      }
      resourceName={resourceName}
      itemCount={rows.length}
      headings={columnHeadings as IndexTableProps["headings"]}
    >
      {rowMarkup}
    </IndexTable>
  );
}
