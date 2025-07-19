export function convertNodeFieldsToObj(metaobjectNode: { [key: string]: any }) {
  const flatFields: { [key: string]: any } = {};

  if (!metaobjectNode?.fields) return flatFields;

  for (const field of metaobjectNode.fields) {
    flatFields[field.key] = field.jsonValue ?? null;
  }

  return {
    id: metaobjectNode.id,
    type: metaobjectNode.type,
    handle: metaobjectNode.handle,
    ...flatFields,
  };
}
