/**
 * Integration tests for subscriptions API routes.
 * Phase 4 of the integration tests plan.
 * Mocks: requireAuth, prisma.user, Firestore (firebase-admin/firestore).
 */
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest, NextResponse } from "next/server";
import { GET as SubscriptionsCurrentGET } from "@/app/api/subscriptions/current/route";
import { POST as SubscriptionsPortalLinkPOST } from "@/app/api/subscriptions/portal-link/route";
import { GET as TrialEligibilityGET } from "@/app/api/subscriptions/trial-eligibility/route";
import { requireAuth } from "@/features/auth/services/firebase-middleware";
import { adminAuth } from "@/shared/services/firebase/admin";
import { requireCSRFToken } from "@/shared/services/csrf/csrf-protection";
import { prisma } from "@/shared/services/db/prisma";

// ---------------------------------------------------------------------------
// Mock Firestore
// ---------------------------------------------------------------------------
const mockSubscriptionDoc = {
  id: "sub-1",
  data: () => ({
    status: "active",
    metadata: { tier: "basic", billingCycle: "monthly" },
    current_period_start: Math.floor(Date.now() / 1000) - 86400,
    current_period_end: Math.floor(Date.now() / 1000) + 86400 * 29,
    trial_end: null,
  }),
};

const mockTrialingDoc = {
  id: "sub-trialing",
  data: () => ({
    status: "trialing",
    metadata: { tier: "pro", billingCycle: "monthly" },
    current_period_start: Math.floor(Date.now() / 1000) - 86400,
    current_period_end: Math.floor(Date.now() / 1000) + 86400 * 13,
    trial_end: Math.floor(Date.now() / 1000) + 86400 * 13,
  }),
};

const subscriptionsCollMock = {
  where: mock().mockReturnThis(),
  get: mock(),
};

const customerDocMock = {
  collection: mock(() => subscriptionsCollMock),
};

const firestoreMock = {
  collection: mock(() => ({
    doc: mock(() => customerDocMock),
  })),
};

mock.module("firebase-admin/firestore", () => ({
  getFirestore: mock(() => firestoreMock),
}));

// Mock fetch for portal-link route (calls Firebase Extension)
const fetchMock = mock();
(global as any).fetch = fetchMock;

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

describe("Subscriptions API Integration Tests", () => {
  beforeEach(() => {
    (requireAuth as any).mockResolvedValue(mockAuthResult);
    adminAuth.verifyIdToken.mockResolvedValue({
      uid: "test-user-uid",
      email: "test@example.com",
    } as any);
    (requireCSRFToken as any).mockResolvedValue(true);
    prisma.user.findUnique.mockResolvedValue({
      ...mockAuthResult.user,
      hasUsedFreeTrial: false,
    } as any);
    prisma.user.update.mockResolvedValue(mockAuthResult.user as any);
    subscriptionsCollMock.where.mockReturnThis();
    subscriptionsCollMock.get.mockResolvedValue({
      empty: false,
      docs: [mockSubscriptionDoc],
    });
    firestoreMock.collection.mockReturnValue({
      doc: mock(() => customerDocMock),
    });
    customerDocMock.collection.mockReturnValue(subscriptionsCollMock);
  });

  // ---------------------------------------------------------------------------
  // GET /api/subscriptions/current
  // ---------------------------------------------------------------------------
  describe("GET /api/subscriptions/current", () => {
    test("returns 401 for unauthenticated request", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/current",
        { method: "GET" }
      );
      const response = await SubscriptionsCurrentGET(request);
      expect(response.status).toBe(401);
    });

    test("returns 200 with subscription data when active subscription found", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/current",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await SubscriptionsCurrentGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toBeDefined();
      expect(data.data.subscription).toBeDefined();
      expect(data.data.tier).toBeDefined();
    });

    test("returns 200 with null subscription when no active subscriptions", async () => {
      subscriptionsCollMock.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/current",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await SubscriptionsCurrentGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.subscription).toBeNull();
      expect(data.data.tier).toBeNull();
    });

    test("marks hasUsedFreeTrial when user has trialing subscription", async () => {
      subscriptionsCollMock.get.mockResolvedValue({
        empty: false,
        docs: [mockTrialingDoc],
      });
      prisma.user.findUnique.mockResolvedValue({
        ...mockAuthResult.user,
        hasUsedFreeTrial: false,
      } as any);

      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/current",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await SubscriptionsCurrentGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.isInTrial).toBe(true);
    });

    test("returns 400 when user has no firebaseUid", async () => {
      (requireAuth as any).mockResolvedValue({
        ...mockAuthResult,
        user: { ...mockAuthResult.user, firebaseUid: null },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/current",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await SubscriptionsCurrentGET(request);

      expect(response.status).toBe(400);
    });
  });

  // ---------------------------------------------------------------------------
  // POST /api/subscriptions/portal-link
  // ---------------------------------------------------------------------------
  describe("POST /api/subscriptions/portal-link", () => {
    test("returns 401 for unauthenticated request", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/portal-link",
        { method: "POST" }
      );
      const response = await SubscriptionsPortalLinkPOST(request);
      expect(response.status).toBe(401);
    });

    test("returns 401 when no Bearer token in headers", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/portal-link",
        {
          method: "POST",
          headers: {}, // No Authorization header
        }
      );
      const response = await SubscriptionsPortalLinkPOST(request);
      expect(response.status).toBe(401);
    });

    test("returns 200 with portal URL when Firebase Extension responds correctly", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: { url: "https://billing.stripe.com/portal/session-123" },
          }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/portal-link",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const response = await SubscriptionsPortalLinkPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.url).toBeDefined();
    });

    test("returns 500 when Firebase Extension call fails", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Internal server error" }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/portal-link",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const response = await SubscriptionsPortalLinkPOST(request);

      expect(response.status).toBe(500);
    });
  });

  // ---------------------------------------------------------------------------
  // GET /api/subscriptions/trial-eligibility
  // ---------------------------------------------------------------------------
  describe("GET /api/subscriptions/trial-eligibility", () => {
    test("returns 401 for unauthenticated request", async () => {
      (requireAuth as any).mockResolvedValue(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/trial-eligibility",
        { method: "GET" }
      );
      const response = await TrialEligibilityGET(request);
      expect(response.status).toBe(401);
    });

    test("returns 200 with eligible: true for new user", async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockAuthResult.user,
        hasUsedFreeTrial: false,
      } as any);
      // No trialing subscription
      subscriptionsCollMock.get.mockResolvedValue({ empty: true, docs: [] });

      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/trial-eligibility",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await TrialEligibilityGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.isEligible).toBe(true);
      expect(data.data.hasUsedFreeTrial).toBe(false);
    });

    test("returns 200 with eligible: false for user who already used trial", async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockAuthResult.user,
        hasUsedFreeTrial: true,
      } as any);
      subscriptionsCollMock.get.mockResolvedValue({ empty: true, docs: [] });

      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/trial-eligibility",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await TrialEligibilityGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.isEligible).toBe(false);
      expect(data.data.hasUsedFreeTrial).toBe(true);
    });

    test("returns 200 with eligible: false when currently trialing", async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockAuthResult.user,
        hasUsedFreeTrial: false,
      } as any);
      subscriptionsCollMock.get.mockResolvedValue({
        empty: false,
        docs: [mockTrialingDoc],
      });

      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/trial-eligibility",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await TrialEligibilityGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.isEligible).toBe(false);
      expect(data.data.isInTrial).toBe(true);
    });

    test("response includes hasUsedFreeTrial and isInTrial fields", async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockAuthResult.user,
        hasUsedFreeTrial: false,
      } as any);
      subscriptionsCollMock.get.mockResolvedValue({ empty: true, docs: [] });

      const request = new NextRequest(
        "http://localhost:3000/api/subscriptions/trial-eligibility",
        {
          method: "GET",
          headers: { Authorization: "Bearer test-token" },
        }
      );
      const response = await TrialEligibilityGET(request);
      const data = await response.json();

      expect(data.data.hasUsedFreeTrial).toBeDefined();
      expect(data.data.isInTrial).toBeDefined();
    });
  });
});
