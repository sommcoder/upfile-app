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
      <Card>
        <Select
          label="Theme"
          options={statusOptions}
          onChange={handleSelectChange}
          value={selectedType}
        ></Select>
      </Card>
    </BlockStack>
  );
}
