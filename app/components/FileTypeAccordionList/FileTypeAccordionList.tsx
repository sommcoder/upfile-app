import {
  ChoiceList,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  Text,
  Button,
} from "@shopify/polaris";
import {
  audioVideoFileChoices,
  compressionFileChoices,
  docFileChoices,
  fontFileChoices,
  imageFileChoices,
  modelFileChoices,
  webFileChoices,
} from "app/constants/newWidgetForm";
import { useRef, useState } from "react";
import { CaretDownIcon } from "@shopify/polaris-icons";

const fileTypeSections = [
  { title: "Image Files", choices: imageFileChoices },
  { title: "Document Files", choices: docFileChoices },
  { title: "Text Files", choices: modelFileChoices },
  { title: "Web Files (no JavaScript)", choices: webFileChoices },
  { title: "Audio/Video Files", choices: audioVideoFileChoices },
  { title: "Compression Files", choices: compressionFileChoices },
  { title: "Font Files", choices: fontFileChoices },
];

export function FileTypeAccordionList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedValues, setSelectedValues] = useState<{
    [key: number]: string[];
  }>({});

  const toggleSection = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const handleChoiceChange = (index: number, values: string[]) => {
    setSelectedValues((prev) => ({ ...prev, [index]: values }));
  };

  const handleClearAll = () => {
    setSelectedValues({});
  };

  const totalSelected = Object.values(selectedValues).reduce(
    (acc, val) => acc + val.length,
    0,
  );

  return (
    <InlineGrid gap="300">
      <InlineStack align="space-between">
        <Text as="h5" fontWeight="bold" alignment="center">
          Total Files: {totalSelected}
        </Text>
        <Button tone="critical" variant="secondary" onClick={handleClearAll}>
          Clear All
        </Button>
      </InlineStack>

      {fileTypeSections.map((section, index) => {
        const isOpen = openIndex === index;
        const selected = selectedValues[index] || [];

        return (
          <div
            key={index}
            style={{ border: "1px solid #ccc", borderRadius: "8px" }}
          >
            <div
              onClick={() => toggleSection(index)}
              style={{
                cursor: "pointer",
                borderRadius: "6px",
                padding: "12px 16px",
                backgroundColor: "#fefeff",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${index}`}
            >
              <span>{section.title}</span>
              <span
                style={{
                  transition: "transform 0.35s ease",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <Icon source={CaretDownIcon} tone="base" />
              </span>
            </div>
            {isOpen && <Divider />}
            <div
              id={`accordion-panel-${index}`}
              ref={(el) => (contentRefs.current[index] = el)}
              style={{
                maxHeight: isOpen
                  ? (contentRefs.current[index]?.scrollHeight ?? "400px")
                  : 0,
                overflow: "hidden",
                transition: "max-height 0.35s ease",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                <ChoiceList
                  allowMultiple
                  title=""
                  choices={section.choices}
                  selected={selected}
                  onChange={(value) => handleChoiceChange(index, value)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </InlineGrid>
  );
}
