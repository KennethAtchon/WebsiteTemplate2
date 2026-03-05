/**
 * Contact Form Integration Test - Simplified
 * Tests basic form functionality with actual component structure
 */
/// <reference lib="dom" />
import { describe, it, expect, afterEach, mock, beforeAll, beforeEach } from "bun:test";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Create stable mock references
const stableNavigate = mock();
const stableLocation = { pathname: "/contact" };
const stableAuthenticatedFetch = mock(() => Promise.resolve({ ok: true }));
const stableAuthObject = { authenticatedFetch: stableAuthenticatedFetch };

// Mock user state
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
    Send: () => null,
  }));

  // Mock publicFetch since ContactForm uses it
  mock.module("@/shared/services/api/safe-fetch", () => ({
    publicFetch: stableAuthenticatedFetch,
  }));

  // Mock toast notifications
  mock.module("sonner", () => ({
    toast: {
      success: mock(),
      error: mock(),
    },
  }));
});

// Import component AFTER mocking
import ContactForm from "@/features/contact/components/contact-form";

describe("Contact Form Integration", () => {
  beforeEach(() => {
    // Reset state for each test
    mockUser = null;
    mockAuthLoading = false;
    stableLocation.pathname = "/contact";
    stableNavigate.mockClear();
    stableAuthenticatedFetch.mockClear();
    stableAuthenticatedFetch.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("renders contact form with required fields", () => {
    render(<ContactForm onSuccess={() => {}} />);

    expect(screen.getByLabelText(/your_name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email_address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone_number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/what_contacting/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("submits form successfully with valid data", async () => {
    render(<ContactForm onSuccess={() => {}} />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/your_name/i), { 
      target: { value: "John Doe" } 
    });
    fireEvent.change(screen.getByLabelText(/email_address/i), { 
      target: { value: "john@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: "Test message content" } 
    });

    // Select radio button for subject
    const generalRadio = screen.getByLabelText(/general_inquiry/i);
    fireEvent.click(generalRadio);

    const submitButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(submitButton);

    // Should call publicFetch with form data
    await waitFor(() => {
      expect(stableAuthenticatedFetch).toHaveBeenCalledWith(
        "/api/shared/contact-messages",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("John Doe")
        })
      );
    });
  });

  it("shows loading state during submission", async () => {
    // Mock slow API response
    stableAuthenticatedFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
    );

    render(<ContactForm onSuccess={() => {}} />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/your_name/i), { 
      target: { value: "John Doe" } 
    });
    fireEvent.change(screen.getByLabelText(/email_address/i), { 
      target: { value: "john@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: "Test message" } 
    });

    const generalRadio = screen.getByLabelText(/general_inquiry/i);
    fireEvent.click(generalRadio);

    const submitButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(submitButton);

    // Should show loading state
    expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(stableAuthenticatedFetch).toHaveBeenCalled();
    }, { timeout: 200 });
  });

  it("handles API errors gracefully", async () => {
    // Mock API error
    stableAuthenticatedFetch.mockResolvedValue({ 
      ok: false, 
      status: 500,
      statusText: "Internal Server Error"
    });

    render(<ContactForm onSuccess={() => {}} />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/your_name/i), { 
      target: { value: "John Doe" } 
    });
    fireEvent.change(screen.getByLabelText(/email_address/i), { 
      target: { value: "john@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: "Test message" } 
    });

    const generalRadio = screen.getByLabelText(/general_inquiry/i);
    fireEvent.click(generalRadio);

    const submitButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(submitButton);

    // Should handle error without crashing
    await waitFor(() => {
      expect(stableAuthenticatedFetch).toHaveBeenCalled();
    });

    // Button should be enabled again for retry
    expect(submitButton).toBeEnabled();
  });

  it("calls onSuccess callback after successful submission", async () => {
    const mockOnSuccess = mock();

    render(<ContactForm onSuccess={mockOnSuccess} />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/your_name/i), { 
      target: { value: "John Doe" } 
    });
    fireEvent.change(screen.getByLabelText(/email_address/i), { 
      target: { value: "john@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: "Test message" } 
    });

    const generalRadio = screen.getByLabelText(/general_inquiry/i);
    fireEvent.click(generalRadio);

    const submitButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(submitButton);

    // Should call onSuccess after successful submission
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
