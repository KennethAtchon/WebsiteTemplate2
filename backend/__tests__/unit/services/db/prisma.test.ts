/**
 * Prisma service – getQueryStats, getConnectionPoolStats (mocked in preload).
 */
import { describe, expect, test } from "bun:test";
import {
  getQueryStats,
  getConnectionPoolStats,
} from "@/services/db/prisma";

describe("prisma (mocked)", () => {
  describe("getQueryStats", () => {
    test("returns object (mock may return empty or full shape)", () => {
      const stats = getQueryStats(60);
      expect(stats !== null && typeof stats === "object").toBe(true);
    });

    test("accepts custom minutes", () => {
      const stats = getQueryStats(5);
      expect(stats).toBeDefined();
    });
  });

  describe("getConnectionPoolStats", () => {
    test("returns object (mock may return empty or full shape)", () => {
      const stats = getConnectionPoolStats(60);
      expect(stats !== null && typeof stats === "object").toBe(true);
    });
  });
});
