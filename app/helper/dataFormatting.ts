// can be used on stings
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * @param obj is a data object from Shopify
 * @returns the same object but with keys we can use in JS
 */
export function convertKeysToCamelCase<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase) as T;
  } else if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = toCamelCase(key);
      const newValue = convertKeysToCamelCase(value);
      return { ...acc, [newKey]: newValue };
    }, {} as any);
  }
  return obj;
}

// for just strings
export function toKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * @param obj is a data object from Shopify
 * @returns the same object but with JS keys converted to Shopify data keys
 */
export function convertKeysToKebabCase<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToKebabCase) as T;
  } else if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = toKebabCase(key);
      const newValue = convertKeysToKebabCase(value);
      return { ...acc, [newKey]: newValue };
    }, {} as any);
  }
  return obj;
}

interface MetaobjectField {
  key: string;
  value?: string;
  reference?: {
    id: string;
  };
}

/**
 * @param kebabData => the camelCase to Kebab case data
 * @returns  => kebab case data converted into Shopify valid input for creating metaObjects
 */
export function formatMetaobjectFields(
  kebabData: Record<string, any>,
): MetaobjectField[] {
  return Object.entries(kebabData)
    .map(([key, value]) => {
      if (value === null || value === undefined) return null;

      // Reference: string that looks like a Shopify GID
      if (value.startsWith("gid://shopify/Metaobject/")) {
        return { key, reference: { id: value } };
      }

      // JSON: objects or arrays
      if (typeof value === "object") {
        return { key, value: JSON.stringify(value) };
      }

      // Scalar: string, number, boolean
      return { key, value: String(value) };
    })
    .filter(Boolean) as MetaobjectField[];
}
