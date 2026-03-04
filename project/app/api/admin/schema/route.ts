import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/infrastructure/database/lib/generated/prisma";
import debugLog from "@/shared/utils/debug";
import { withAdminProtection } from "@/shared/middleware/api-route-protection";

async function getHandler(_request: NextRequest) {
  try {
    // Access DMMF from server-side Prisma instance
    const dmmf = Prisma.dmmf;

    if (!dmmf || !dmmf.datamodel) {
      return NextResponse.json(
        { error: "DMMF not available" },
        { status: 500 }
      );
    }

    // Extract model information
    const models = dmmf.datamodel.models.map((model) => ({
      name: model.name,
      fields: model.fields.map((field) => ({
        name: field.name,
        type: field.type,
        isRequired: field.isRequired,
        isId: field.isId,
        hasDefaultValue: field.hasDefaultValue,
        isList: field.isList,
      })),
    }));

    return NextResponse.json({ models });
  } catch (error) {
    debugLog.error(
      "Failed to fetch schema",
      { service: "admin-schema", operation: "GET" },
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch schema" },
      { status: 500 }
    );
  }
}

export const GET = withAdminProtection(getHandler, {
  rateLimitType: "admin",
});
