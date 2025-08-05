function toCamelCase(str: string): string {
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
