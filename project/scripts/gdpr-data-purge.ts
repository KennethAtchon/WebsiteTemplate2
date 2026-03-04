/**
 * GDPR Automated Data Purge Script
 *
 * Purges data according to the retention policy in docs/runbooks/data-retention-policy.md:
 *   - Hard-deletes soft-deleted users older than 30 days
 *   - Deletes calculator history older than 12 months
 *   - Deletes contact messages older than 2 years
 *   - Deletes old orders (soft-deleted) older than 30 days
 *
 * Run manually or schedule via Railway cron / GitHub Actions cron workflow.
 *
 * Usage:
 *   bun run scripts/gdpr-data-purge.ts
 *   bun run scripts/gdpr-data-purge.ts --dry-run
 */

import { PrismaClient } from "../infrastructure/lib/generated/prisma";

const prisma = new PrismaClient();
const isDryRun = process.argv.includes("--dry-run");

interface PurgeResult {
  deletedUsers: number;
  deletedFeatureUsage: number;
  deletedContactMessages: number;
  deletedOrders: number;
}

async function runPurge(): Promise<PurgeResult> {
  const now = new Date();

  // Thresholds
  const userSoftDeleteThreshold = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  ); // 30 days
  const featureUsageThreshold = new Date(
    now.getTime() - 365 * 24 * 60 * 60 * 1000
  ); // 12 months
  const contactMessageThreshold = new Date(
    now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000
  ); // 2 years
  const orderSoftDeleteThreshold = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  ); // 30 days

  console.log(
    `[GDPR Purge] ${isDryRun ? "DRY RUN — " : ""}Starting purge at ${now.toISOString()}`
  );

  // 1. Hard-delete users that were soft-deleted > 30 days ago
  const usersToDelete = await prisma.user.findMany({
    where: {
      isDeleted: true,
      deletedAt: { lt: userSoftDeleteThreshold },
    },
    select: { id: true, email: true },
  });

  console.log(`[GDPR Purge] Users to hard-delete: ${usersToDelete.length}`);

  let deletedUsers = 0;
  if (!isDryRun && usersToDelete.length > 0) {
    const userIds = usersToDelete.map((u) => u.id);

    // Delete related records first (FK constraints)
    await prisma.featureUsage.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.order.deleteMany({ where: { userId: { in: userIds } } });
    const result = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
    deletedUsers = result.count;
  } else {
    deletedUsers = usersToDelete.length;
  }

  // 2. Delete calculator history older than 12 months
  const featureUsageCount = await prisma.featureUsage.count({
    where: { createdAt: { lt: featureUsageThreshold } },
  });

  console.log(
    `[GDPR Purge] Feature usage records to delete (> 12 months): ${featureUsageCount}`
  );

  let deletedFeatureUsage = 0;
  if (!isDryRun && featureUsageCount > 0) {
    const result = await prisma.featureUsage.deleteMany({
      where: { createdAt: { lt: featureUsageThreshold } },
    });
    deletedFeatureUsage = result.count;
  } else {
    deletedFeatureUsage = featureUsageCount;
  }

  // 3. Delete contact messages older than 2 years
  const contactMessageCount = await prisma.contactMessage.count({
    where: { createdAt: { lt: contactMessageThreshold } },
  });

  console.log(
    `[GDPR Purge] Contact messages to delete (> 2 years): ${contactMessageCount}`
  );

  let deletedContactMessages = 0;
  if (!isDryRun && contactMessageCount > 0) {
    const result = await prisma.contactMessage.deleteMany({
      where: { createdAt: { lt: contactMessageThreshold } },
    });
    deletedContactMessages = result.count;
  } else {
    deletedContactMessages = contactMessageCount;
  }

  // 4. Hard-delete soft-deleted orders older than 30 days
  const ordersToDelete = await prisma.order.count({
    where: {
      isDeleted: true,
      deletedAt: { lt: orderSoftDeleteThreshold },
    },
  });

  console.log(
    `[GDPR Purge] Soft-deleted orders to hard-delete: ${ordersToDelete}`
  );

  let deletedOrders = 0;
  if (!isDryRun && ordersToDelete > 0) {
    const result = await prisma.order.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lt: orderSoftDeleteThreshold },
      },
    });
    deletedOrders = result.count;
  } else {
    deletedOrders = ordersToDelete;
  }

  return {
    deletedUsers,
    deletedFeatureUsage,
    deletedContactMessages,
    deletedOrders,
  };
}

async function main() {
  try {
    await prisma.$connect();
    const result = await runPurge();

    console.log("\n[GDPR Purge] Summary:");
    console.log(`  Users hard-deleted:         ${result.deletedUsers}`);
    console.log(`  Feature usage records:      ${result.deletedFeatureUsage}`);
    console.log(
      `  Contact messages:           ${result.deletedContactMessages}`
    );
    console.log(`  Orders hard-deleted:        ${result.deletedOrders}`);
    console.log(`  Mode: ${isDryRun ? "DRY RUN (no data deleted)" : "LIVE"}`);
    console.log("[GDPR Purge] Complete.\n");

    process.exit(0);
  } catch (error) {
    console.error("[GDPR Purge] Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
