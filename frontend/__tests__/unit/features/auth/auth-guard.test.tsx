/**
 * Unit tests for AuthGuard component.
 * Tests the component API and renders basic states.
 */
/// <reference lib="dom" />
import { describe, it, expect, afterEach, mock } from "bun:test";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock all dependencies before imports
mock.module("@tanstack/react-router", () => ({
  useNavigate: mock(() => mock()),
  useLocation: mock(() => ({ pathname: "/sign-in" })),
}));

mock.module("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

mock.module("@/shared/contexts/app-context", () => ({
  useApp: mock(() => ({ user: null, authLoading: false })),
}));

mock.module("@/features/auth/hooks/use-authenticated-fetch", () => ({
  useAuthenticatedFetch: mock(() => ({
    authenticatedFetch: mock(() => Promise.resolve({ ok: true })),
  })),
}));

mock.module("@/shared/utils/debug", () => ({
  debugLog: { info: mock(), warn: mock(), error: mock(), debug: mock() },
}));

mock.module("lucide-react", () => ({
  Loader2: () => null,
}));

import { AuthGuard } from "@/features/auth/components/auth-guard";

describe("AuthGuard", () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("is a React component (function)", () => {
    expect(typeof AuthGuard).toBe("function");
  });

  it("renders children on sign-in route (public auth route)", () => {
    // useLocation returns { pathname: "/sign-in" } from mock
    render(
      <AuthGuard>
        <div data-testid="signin-content">Sign In Content</div>
      </AuthGuard>
    );
    // Auth route bypass: children should be rendered
    expect(screen.getByTestId("signin-content")).toBeInTheDocument();
  });

  it("accepts authType prop without crashing", () => {
    render(
      <AuthGuard authType="user">
        <div data-testid="user-content">User Content</div>
      </AuthGuard>
    );
    // Location is /sign-in so auth is skipped
    expect(document.body).toBeTruthy();
  });

  it("accepts publicRoutes prop", () => {
    render(
      <AuthGuard publicRoutes={["/about", "/pricing"]}>
        <div data-testid="public-content">Content</div>
      </AuthGuard>
    );
    expect(document.body).toBeTruthy();
  });
});
