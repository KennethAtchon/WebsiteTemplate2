/**
 * Integration Test Setup
 * Provides common setup and utilities for integration tests
 * Simplified to prevent hanging and improve reliability
 */

import { mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Register Happy-DOM for all integration tests
GlobalRegistrator.register();

// Cleanup after all tests
process.on('exit', () => {
  GlobalRegistrator.unregister();
});

// Common mock utilities
export const createMockNavigate = () => mock();
export const createMockLocation = (pathname = "/") => ({ pathname });
export const createMockAuthenticatedFetch = () => mock(() => Promise.resolve({ ok: true }));

// Mock user state management
export const createMockUserState = () => {
  let mockUser: any = null;
  let mockAuthLoading = false;
  
  return {
    get user() { return mockUser; },
    get authLoading() { return mockAuthLoading; },
    setUser: (user: any) => { mockUser = user; },
    setAuthLoading: (loading: boolean) => { mockAuthLoading = loading; },
    reset: () => {
      mockUser = null;
      mockAuthLoading = false;
    }
  };
};

// Common mock objects
export const createMockTranslation = () => ({ t: (key: string) => key });
export const createMockDebugLog = () => ({ 
  info: mock(), 
  warn: mock(), 
  error: mock(), 
  debug: mock() 
});

// Test cleanup utilities
export const cleanupTest = () => {
  // Force DOM cleanup
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
  
  // Clear timers
  if (typeof clearTimeout !== 'undefined') {
    const maxTimerId = setTimeout(() => {}, 0);
    for (let i = 1; i <= maxTimerId; i++) {
      clearTimeout(i);
    }
  }
};

// Common mock setup for integration tests
export const setupCommonMocks = (mocks: {
  navigate?: ReturnType<typeof createMockNavigate>;
  location?: ReturnType<typeof createMockLocation>;
  authenticatedFetch?: ReturnType<typeof createMockAuthenticatedFetch>;
  userState?: ReturnType<typeof createMockUserState>;
  translation?: ReturnType<typeof createMockTranslation>;
  debugLog?: ReturnType<typeof createMockDebugLog>;
}) => {
  const {
    navigate = createMockNavigate(),
    location = createMockLocation(),
    authenticatedFetch = createMockAuthenticatedFetch(),
    userState = createMockUserState(),
    translation = createMockTranslation(),
    debugLog = createMockDebugLog()
  } = mocks;

  // Mock router
  mock.module("@tanstack/react-router", () => ({
    useNavigate: () => navigate,
    useLocation: () => location,
  }));

  // Mock i18n
  mock.module("react-i18next", () => ({
    useTranslation: () => translation,
  }));

  // Mock app context
  mock.module("@/shared/contexts/app-context", () => ({
    useApp: () => userState,
  }));

  // Mock authenticated fetch
  mock.module("@/features/auth/hooks/use-authenticated-fetch", () => ({
    useAuthenticatedFetch: () => ({ authenticatedFetch }),
  }));

  // Mock debug utils
  mock.module("@/shared/utils/debug", () => ({
    debugLog,
  }));

  // Mock common UI components
  mock.module("lucide-react", () => ({
    Loader2: () => null,
    Send: () => null,
  }));

  // Mock toast notifications
  mock.module("sonner", () => ({
    toast: {
      success: mock(),
      error: mock(),
    },
  }));

  // Mock API service
  mock.module("@/shared/services/api/safe-fetch", () => ({
    publicFetch: authenticatedFetch,
  }));

  return {
    navigate,
    location,
    authenticatedFetch,
    userState,
    translation,
    debugLog
  };
};
