/**
 * Integration tests for health/live and calculator API routes.
 * Mocks: requireAuth, prisma (user, featureUsage), rate limit (preload).
 */
import { beforeEach, describe, expect, test } from "bun:test";
import { NextRequest, NextResponse } from "next/server";
import { GET as LiveGET } from "@/app/api/live/route";
import { POST as CalculatorCalculatePOST } from "@/app/api/calculator/calculate/route";
import { requireAuth } from "@/features/auth/services/firebase-middleware";
import { requireCSRFToken } from "@/shared/services/csrf/csrf-protection";
import { adminAuth } from "@/shared/services/firebase/admin";

const mockAuthResult = {
  user: {
    id: "test-user-id",
    firebaseUid: "test-user-uid",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    isActive: true,
    isDeleted: false,
    timezone: "UTC",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  userId: "test-user-uid",
  firebaseUser: {
    uid: "test-user-uid",
    email: "test@example.com",
    stripeRole: "basic",
  },
};

describe("API Health and Calculator Integration Tests", () => {
  beforeEach(() => {
    (requireAuth as any).mockClear?.();
    (requireCSRFToken as any).mockResolvedValue?.(true);
    adminAuth.verifyIdToken.mockResolvedValue?.({
      uid: "test-user-uid",
    } as any);
    // Default: allow auth so tests that need it can override
    (requireAuth as any).mockResolvedValue(mockAuthResult);
  });

  describe("GET /api/live", () => {
    test("returns 200 with alive: true and process details", async () => {
      const request = new NextRequest("http://localhost:3000/api/live", {
        method: "GET",
      });
      const response = await LiveGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.alive).toBe(true);
      expect(data.timestamp).toBeDefined();
      expect(data.uptime).toBeDefined();
      expect(data.response_time_ms).toBeDefined();
    });

    test("returns 503 when memory usage exceeds 1GB (liveness fail)", async () => {
      const orig = process.memoryUsage;
      try {
        process.memoryUsage = () => ({
          rss: 2 * 1024 * 1024 * 1024,
          heapTotal: 0,
          heapUsed: 0,
          external: 0,
          arrayBuffers: 0,
        });
        const request = new NextRequest("http://localhost:3000/api/live", {
          method: "GET",
        });
        const response = await LiveGET(request);
        const data = await response.json();
        expect(response.status).toBe(503);
        expect(data.alive).toBe(false);
        expect(data.memory_mb ?? data.error).toBeDefined();
      } finally {
        process.memoryUsage = orig;
      }
    });
  });

  describe("POST /api/calculator/calculate", () => {
    test("rejects unauthenticated request with 401", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/calculator/calculate",
        {
          method: "POST",
          body: JSON.stringify({
            type: "mortgage",
            inputs: {
              loanAmount: 200000,
              interestRate: 5,
              loanTerm: 30,
            },
          }),
        }
      );
      const response = await CalculatorCalculatePOST(request);
      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
    });

    test("returns 200 and calculation result for valid mortgage request", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/calculator/calculate",
        {
          method: "POST",
          headers: { Authorization: "Bearer test-token" },
          body: JSON.stringify({
            type: "mortgage",
            inputs: {
              loanAmount: 200000,
              interestRate: 5,
              loanTerm: 30,
            },
          }),
        }
      );
      const response = await CalculatorCalculatePOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data.type).toBe("mortgage");
      expect(data.data.results).toBeDefined();
      expect(data.data.results.monthlyPayment).toBeGreaterThan(0);
      expect(data.data.results.amortizationSchedule).toBeDefined();
    });

    test("returns 400 for invalid calculation type", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/calculator/calculate",
        {
          method: "POST",
          headers: { Authorization: "Bearer test-token" },
          body: JSON.stringify({
            type: "invalid",
            inputs: {},
          }),
        }
      );
      const response = await CalculatorCalculatePOST(request);
      expect(response.status).toBe(400);
    });

    test("returns 400 for invalid mortgage inputs", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/calculator/calculate",
        {
          method: "POST",
          headers: { Authorization: "Bearer test-token" },
          body: JSON.stringify({
            type: "mortgage",
            inputs: {
              loanAmount: -1,
              interestRate: 5,
              loanTerm: 30,
            },
          }),
        }
      );
      const response = await CalculatorCalculatePOST(request);
      expect(response.status).toBe(400);
    });

    test("returns 200 for valid loan calculation", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/calculator/calculate",
        {
          method: "POST",
          headers: { Authorization: "Bearer test-token" },
          body: JSON.stringify({
            type: "loan",
            inputs: {
              principal: 10000,
              interestRate: 5,
              term: 24,
            },
          }),
        }
      );
      const response = await CalculatorCalculatePOST(request);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.data?.type).toBe("loan");
      expect(data.data?.results?.monthlyPayment).toBeGreaterThan(0);
    });

    test("returns 200 for valid investment calculation (pro tier)", async () => {
      (requireAuth as any).mockResolvedValue({
        ...mockAuthResult,
        firebaseUser: { ...mockAuthResult.firebaseUser, stripeRole: "pro" },
      });
      const request = new NextRequest(
        "http://localhost:3000/api/calculator/calculate",
        {
          method: "POST",
          headers: { Authorization: "Bearer test-token" },
          body: JSON.stringify({
            type: "investment",
            inputs: {
              initialInvestment: 5000,
              monthlyContribution: 200,
              annualInterestRate: 6,
              years: 10,
            },
          }),
        }
      );
      const response = await CalculatorCalculatePOST(request);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.data?.type).toBe("investment");
      expect(data.data?.results?.futureValue).toBeGreaterThan(0);
    });

    test("returns 200 for valid retirement calculation (enterprise tier)", async () => {
      (requireAuth as any).mockResolvedValue({
        ...mockAuthResult,
        firebaseUser: {
          ...mockAuthResult.firebaseUser,
          stripeRole: "enterprise",
        },
      });
      const request = new NextRequest(
        "http://localhost:3000/api/calculator/calculate",
        {
          method: "POST",
          headers: { Authorization: "Bearer test-token" },
          body: JSON.stringify({
            type: "retirement",
            inputs: {
              currentAge: 30,
              retirementAge: 65,
              currentSavings: 50000,
              monthlyContribution: 500,
              annualReturnRate: 6,
              expectedRetirementSpending: 5000,
            },
          }),
        }
      );
      const response = await CalculatorCalculatePOST(request);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.data?.type).toBe("retirement");
      expect(data.data?.results).toBeDefined();
    });

    test("returns 400 for invalid loan inputs", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/calculator/calculate",
        {
          method: "POST",
          headers: { Authorization: "Bearer test-token" },
          body: JSON.stringify({
            type: "loan",
            inputs: { principal: 10000, interestRate: 5 },
          }),
        }
      );
      const response = await CalculatorCalculatePOST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    test("returns 403 when subscription required (investment without pro)", async () => {
      (requireAuth as any).mockResolvedValue({
        ...mockAuthResult,
        firebaseUser: { ...mockAuthResult.firebaseUser, stripeRole: "basic" },
      });
      const request = new NextRequest(
        "http://localhost:3000/api/calculator/calculate",
        {
          method: "POST",
          headers: { Authorization: "Bearer test-token" },
          body: JSON.stringify({
            type: "investment",
            inputs: {
              initialInvestment: 5000,
              annualInterestRate: 6,
              years: 10,
            },
          }),
        }
      );
      const response = await CalculatorCalculatePOST(request);
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toMatch(/tier|subscription|upgrade/i);
    });

    test("returns 403 when no stripeRole (subscription required)", async () => {
      (requireAuth as any).mockResolvedValue({
        ...mockAuthResult,
        firebaseUser: { ...mockAuthResult.firebaseUser, stripeRole: null },
      });
      const request = new NextRequest(
        "http://localhost:3000/api/calculator/calculate",
        {
          method: "POST",
          headers: { Authorization: "Bearer test-token" },
          body: JSON.stringify({
            type: "loan",
            inputs: { principal: 10000, interestRate: 5, term: 24 },
          }),
        }
      );
      const response = await CalculatorCalculatePOST(request);
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toMatch(/subscription|Active subscription/i);
    });
  });
});
