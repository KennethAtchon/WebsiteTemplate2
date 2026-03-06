import debugLog from "@/utils/debug/debug";

export interface TableConfig {
  name: string;
  keyFields: string[];
  apiEndpoint: string;
  fieldsInfo: Record<string, FieldInfo>;
}

export interface FieldInfo {
  type: string;
  isRequired: boolean;
  isId: boolean;
  hasDefaultValue: boolean;
}

// Cache for schema data
let schemaCache: { models: any[] } | null = null;
let schemaPromise: Promise<{ models: any[] } | null> | null = null;

// Export a function to clear cache for testing
export function __clearCache() {
  schemaCache = null;
  schemaPromise = null;
}

// Fetch schema from API endpoint
async function fetchSchema(): Promise<{ models: any[] } | null> {
  if (schemaCache) {
    return schemaCache;
  }

  if (schemaPromise) {
    return schemaPromise;
  }

  schemaPromise = (async (): Promise<{ models: any[] } | null> => {
    try {
      // Use dynamic import to avoid issues in server-side contexts
      const { safeFetch } = await import("@/services/api/safe-fetch");
      const response = await safeFetch("/api/admin/schema");
      if (!response.ok) {
        throw new Error("Failed to fetch schema");
      }
      const data = (await response.json()) as { models: any[] };
      schemaCache = data;
      return data;
    } catch (error) {
      debugLog.error(
        "Error fetching schema",
        { service: "prisma-introspection", operation: "fetchSchema" },
        error,
      );
      return null;
    } finally {
      schemaPromise = null;
    }
  })();

  return schemaPromise;
}

// Extract field information from fetched schema
async function getPrismaFieldInfo(
  modelName: string,
): Promise<{ fields: string[]; fieldsInfo: Record<string, FieldInfo> }> {
  try {
    const schema = await fetchSchema();

    if (!schema || !schema.models) {
      debugLog.warn(
        `Schema not available for model ${modelName}`,
        { service: "prisma-introspection", operation: "getPrismaFieldInfo" },
        { modelName },
      );
      return { fields: [], fieldsInfo: {} };
    }

    const model = schema.models.find((m: any) => m.name === modelName);

    if (!model) {
      debugLog.warn(
        `Model ${modelName} not found in schema`,
        { service: "prisma-introspection", operation: "getPrismaFieldInfo" },
        { modelName },
      );
      return { fields: [], fieldsInfo: {} };
    }

    const fields: string[] = [];
    const fieldsInfo: Record<string, FieldInfo> = {};

    model.fields.forEach((field: any) => {
      // Skip null/undefined fields and fields without required properties
      if (
        !field ||
        typeof field.name !== "string" ||
        typeof field.type !== "string"
      ) {
        return;
      }

      fields.push(field.name);
      fieldsInfo[field.name] = {
        type: field.type,
        isRequired: Boolean(field.isRequired),
        isId: Boolean(field.isId),
        hasDefaultValue: Boolean(field.hasDefaultValue),
      };
    });

    return { fields, fieldsInfo };
  } catch (error) {
    debugLog.error(
      `Error extracting fields for ${modelName}`,
      { service: "prisma-introspection", operation: "getPrismaFieldInfo" },
      error,
    );
    return { fields: [], fieldsInfo: {} };
  }
}

export async function getTableConfigs(): Promise<TableConfig[]> {
  const modelConfigs = [
    { name: "User", apiEndpoint: "/api/users" },
    { name: "Order", apiEndpoint: "/api/admin/orders" },
    { name: "ContactMessage", apiEndpoint: "/api/shared/contact-messages" },
  ];

  const configs = await Promise.all(
    modelConfigs.map(async (config) => {
      const { fields, fieldsInfo } = await getPrismaFieldInfo(config.name);
      return {
        name: config.name,
        keyFields: fields,
        apiEndpoint: config.apiEndpoint,
        fieldsInfo,
      };
    }),
  );

  return configs;
}

export async function generateExpectedParams(
  modelName: string,
): Promise<Record<string, string>> {
  const { fieldsInfo } = await getPrismaFieldInfo(modelName);
  const params: Record<string, string> = {};

  Object.entries(fieldsInfo).forEach(([fieldName, info]) => {
    // Skip auto-generated fields
    if (
      fieldName === "id" ||
      fieldName === "createdAt" ||
      fieldName === "updatedAt"
    ) {
      return;
    }

    let typeStr = info.type.toLowerCase();

    // Map Prisma types to more readable formats
    switch (info.type) {
      case "String":
        typeStr = "string";
        break;
      case "Int":
      case "Float":
      case "Decimal":
        typeStr = "number";
        break;
      case "Boolean":
        typeStr = "boolean";
        break;
      case "DateTime":
        typeStr = "string (ISO date)";
        break;
      case "Json":
        typeStr = "object/array (JSON)";
        break;
      default:
        // Handle arrays and enums
        if (info.type.includes("[]")) {
          typeStr = "array";
        } else {
          typeStr = info.type;
        }
    }

    const required =
      info.isRequired && !info.hasDefaultValue ? "required" : "optional";
    params[fieldName] = `${typeStr} (${required})`;
  });

  return params;
}
