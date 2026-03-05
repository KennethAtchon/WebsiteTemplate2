/**
 * Auth Flow Integration Test - Fixed
 * Tests AuthGuard + AuthProvider + Router integration
 * Simplified to prevent hanging and improve reliability
 */
/// <reference lib="dom" />
import { describe, it, expect, afterEach, mock, beforeAll, beforeEach } from "bun:test";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Create stable mock references for integration testing
const stableNavigate = mock();
const stableLocation = { pathname: "/protected" };
const stableAuthenticatedFetch = mock(() => Promise.resolve({ ok: true }));
const stableAuthObject = { authenticatedFetch: stableAuthenticatedFetch };

// Mock user state that can be updated during tests
let mockUser: any = null;
let mockAuthLoading = false;
const stableAppContext = { 
  get user() { return mockUser; },
  get authLoading() { return mockAuthLoading; }
};

const stableTranslation = { t: (key: string) => key };
const stableDebugLog = { info: mock(), warn: mock(), error: mock(), debug: mock() };

// Mock modules BEFORE any imports
beforeAll(() => {
  mock.module("@tanstack/react-router", () => ({
    useNavigate: () => stableNavigate,
    useLocation: () => stableLocation,
  }));

  mock.module("react-i18next", () => ({
    useTranslation: () => stableTranslation,
  }));

  mock.module("@/shared/contexts/app-context", () => ({
    useApp: () => stableAppContext,
  }));

  mock.module("@/features/auth/hooks/use-authenticated-fetch", () => ({
    useAuthenticatedFetch: () => stableAuthObject,
  }));

  mock.module("@/shared/utils/debug", () => ({
    debugLog: stableDebugLog,
  }));

  mock.module("lucide-react", () => ({
    Loader2: () => null,
  }));
});

// Import components AFTER mocking
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { AuthProvider } from "@/shared/providers/auth-provider";

describe("Auth Flow Integration", () => {
  beforeEach(() => {
    // Reset state for each test
    mockUser = null;
    mockAuthLoading = false;
    stableLocation.pathname = "/protected";
    stableNavigate.mockClear();
    stableAuthenticatedFetch.mockClear();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("redirects to sign-in when accessing protected route without authentication", () => {
    render(
      <AuthProvider>
        <AuthGuard authType="user">
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    // Should not render protected content
    expect(screen.queryByTestId("protected-content")).toBeNull();
    
    // Should redirect to sign-in (check if navigate was called)
    expect(stableNavigate).toHaveBeenCalled();
  });

  it("shows loading state while authentication is in progress", () => {
    // Set loading state
    mockAuthLoading = true;

    render(
      <AuthProvider>
        <AuthGuard authType="user">
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    // Should show loading message
    expect(document.body.textContent).toContain("subscription_manage_loading");
    // Should not render protected content
    expect(screen.queryByTestId("protected-content")).toBeNull();
  });

  it("renders protected content when user is authenticated", () => {
    // Set authenticated user
    mockUser = { 
      uid: "test-user", 
      email: "test@example.com",
      getIdToken: mock(() => Promise.resolve("token")),
      getIdTokenResult: mock(() => Promise.resolve({ claims: { role: "user" } }))
    };
    mockAuthLoading = false;

    render(
      <AuthProvider>
        <AuthGuard authType="user">
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    // Should render protected content
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("bypasses authentication on public routes", () => {
    // Set public route
    stableLocation.pathname = "/about";
    mockUser = null;
    mockAuthLoading = false;

    render(
      <AuthProvider>
        <AuthGuard publicRoutes={["/about", "/pricing"]}>
          <div data-testid="public-content">Public Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    // Should render public content even without authentication
    expect(screen.getByTestId("public-content")).toBeInTheDocument();
    expect(screen.getByText("Public Content")).toBeInTheDocument();
    
    // Should not redirect
    expect(stableNavigate).not.toHaveBeenCalled();
  });

  it("handles admin route authentication", async () => {
    // Set admin user
    mockUser = { 
      uid: "admin-user", 
      email: "admin@example.com",
      getIdToken: mock(() => Promise.resolve("admin-token")),
      getIdTokenResult: mock(() => Promise.resolve({ claims: { role: "admin" } }))
    };
    mockAuthLoading = false;
    stableLocation.pathname = "/admin";

    // Mock successful admin verification
    stableAuthenticatedFetch.mockResolvedValue({ ok: true });

    render(
      <AuthProvider>
        <AuthGuard authType="admin">
          <div data-testid="admin-content">Admin Dashboard</div>
        </AuthGuard>
      </AuthProvider>
    );

    // Should render admin content after async admin verification
    expect(await screen.findByTestId("admin-content")).toBeInTheDocument();
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("prevents non-admin users from accessing admin routes", async () => {
    // Set regular user (not admin) - mock admin verification to fail
    mockUser = { 
      uid: "regular-user", 
      email: "user@example.com",
      getIdToken: mock(() => Promise.resolve("user-token")),
      getIdTokenResult: mock(() => Promise.resolve({ claims: { role: "user" } }))
    };
    mockAuthLoading = false;
    stableLocation.pathname = "/admin";

    // Mock the admin verification API call to fail
    stableAuthenticatedFetch.mockResolvedValue({ ok: false, status: 403 });

    render(
      <AuthProvider>
        <AuthGuard authType="admin">
          <div data-testid="admin-content">Admin Dashboard</div>
        </AuthGuard>
      </AuthProvider>
    );

    // Should not render admin content
    expect(screen.queryByTestId("admin-content")).toBeNull();

    // Should call navigate (redirect) after async admin verification fails
    await waitFor(() => {
      expect(stableNavigate).toHaveBeenCalledWith({ to: "/" });
    });
  });

  it("integrates AuthProvider state with AuthGuard behavior", () => {
    // Start with unauthenticated state
    mockUser = null;
    mockAuthLoading = false;

    const { rerender } = render(
      <AuthProvider>
        <AuthGuard authType="user">
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    // Initially should redirect
    expect(screen.queryByTestId("protected-content")).toBeNull();

    // Simulate user authentication
    mockUser = { 
      uid: "test-user", 
      email: "test@example.com",
      getIdToken: mock(() => Promise.resolve("token")),
      getIdTokenResult: mock(() => Promise.resolve({ claims: { role: "user" } }))
    };

    // Rerender with authenticated user
    rerender(
      <AuthProvider>
        <AuthGuard authType="user">
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>
      </AuthProvider>
    );

    // Should now render protected content
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });
});
