import { BlockStack, Card, Select } from "@shopify/polaris";
import { statusOptions } from "app/constants/newWidgetForm";
import { useCallback, useState } from "react";

export default function WidgetStatusSection() {
  const [selectedType, setSelectedType] = useState("block");
  const [selectedStatus, setSelectedStatus] = useState("draft");

  const handleSelectChange = useCallback(
    (value: string) => setSelectedType(value),
    [],
  );

  // TODO: get a list of the merchants themes for the Theme Field
  // should be a multi select drop down or select all
  //

  // TODO: create a lo

  return (
    <BlockStack gap={"300"}>
      <Card>
        <Select
          label="Status"
          options={statusOptions}
          onChange={handleSelectChange}
          value={selectedType}
        ></Select>
      </Card>
      {/* TODO: this should only be AVAILABLE if the merchant selects injection*/}
      <Card>
        <Select
          label="Theme for Injection"
          options={statusOptions}
          onChange={handleSelectChange}
          value={selectedType}
        ></Select>
      </Card>
    </BlockStack>
  );
}
