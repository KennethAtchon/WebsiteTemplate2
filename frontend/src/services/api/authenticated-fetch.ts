import { auth } from "@/shared/services/firebase/config";
import { safeFetch, SafeFetchOptions } from "./safe-fetch";
import { debugLog } from "@/shared/utils/debug";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
} as const;

const DEFAULT_TIMEOUT = 10000; // 10 seconds

// CSRF token cache (only for authenticated users)
let csrfTokenCache: { token: string; expires: Date } | null = null;

/**
 * Gets a valid CSRF token for authenticated users
 */
async function getCSRFToken(): Promise<string> {
  // Return cached token if still valid
  if (csrfTokenCache && csrfTokenCache.expires > new Date()) {
    return csrfTokenCache.token;
  }

  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  const response = await safeFetch("/api/csrf", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch CSRF token: ${response.status}`);
  }

  const data = await response.json();
  csrfTokenCache = {
    token: data.csrfToken,
    expires: new Date(data.expires),
  };

  return csrfTokenCache.token;
}

/**
 * Clears CSRF token cache
 */
function clearCSRFToken(): void {
  csrfTokenCache = null;
}

/**
 * Checks if request needs CSRF protection
 */
function needsCSRFToken(method: string): boolean {
  const upperMethod = method.toUpperCase();
  return !["GET", "HEAD", "OPTIONS"].includes(upperMethod);
}

/**
 * Authenticated fetch with Firebase token and CSRF protection
 * Uses safeFetch internally for timeout and retry logic
 */
export async function authenticatedFetch(
  url: string,
  requestInit: RequestInit = {}
): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Firebase does not attach tokens to our API calls; we send the token explicitly.
  const idToken = await user.getIdToken();
  const requestHeaders: Record<string, string> = {
    ...DEFAULT_HEADERS,
    Authorization: `Bearer ${idToken}`,
    ...(requestInit.headers as Record<string, string>),
  };

  const method = requestInit.method ?? "GET";
  if (needsCSRFToken(method)) {
    try {
      const csrfToken = await getCSRFToken();
      requestHeaders["X-CSRF-Token"] = csrfToken;

      debugLog.debug(
        "Added CSRF token to request",
        { service: "authenticated-fetch" },
        { method, hasToken: true }
      );
    } catch (error) {
      debugLog.error(
        "Failed to get CSRF token",
        { service: "authenticated-fetch" },
        error
      );
      throw new Error("Failed to get CSRF token");
    }
  }

  const mergedRequestInit: RequestInit = {
    ...requestInit,
    headers: requestHeaders,
  };

  /** Full config for safeFetch: caller's request + auth/CSRF headers + behavior options */
  const safeFetchOptions: SafeFetchOptions = {
    ...mergedRequestInit,
    timeout: DEFAULT_TIMEOUT,
    retryAttempts: 2,
    retryOn: (error: Error) => {
      if (
        error.message.includes("not authenticated") ||
        error.message.includes("CSRF token")
      ) {
        return false;
      }
      return true;
    },
    validateResponse: (_response: Response) => true,
    logRequests: true,
  };

  try {
    const response = await safeFetch(url, safeFetchOptions);

    if (response.status === 403) {
      try {
        const errorData = await response.clone().json();
        if (errorData.code === "CSRF_TOKEN_INVALID") {
          clearCSRFToken();
          throw new Error("CSRF token invalid. Please retry your request.");
        }
      } catch {
        // If we can't parse error, rethrow or continue with original response
      }
    }

    return response;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw err;
  }
}

/**
 * Authenticated fetch with JSON response parsing
 */
export async function authenticatedFetchJson<T = unknown>(
  url: string,
  requestInit: RequestInit = {}
): Promise<T> {
  const response = await authenticatedFetch(url, requestInit);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}`;

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  const jsonData = await response.json();

  // Auto-unwrap standardized API responses
  if (
    jsonData &&
    typeof jsonData === "object" &&
    "data" in jsonData &&
    Object.keys(jsonData).length <= 2 &&
    (Object.keys(jsonData).length === 1 || "meta" in jsonData)
  ) {
    return jsonData.data as T;
  }

  return jsonData as T;
}
