/**
 * Contact Form Integration Test
 * Tests form validation, submission, and error handling
 * Uses existing stable mock infrastructure
 */
/// <reference lib="dom" />
import { describe, it, expect, afterEach, mock, beforeAll, beforeEach } from "bun:test";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Create stable mock references for integration testing
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
});

// Import components AFTER mocking
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

  it("renders contact form with all required fields", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<ContactForm />);

    const submitButton = screen.getByRole("button", { name: /send/i });
    
    // Try to submit empty form
    fireEvent.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    render(<ContactForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send/i });

    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it("submits form successfully with valid data", async () => {
    render(<ContactForm />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: "John Doe" } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: "john@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/subject/i), { 
      target: { value: "Test Subject" } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: "Test message content" } 
    });

    const submitButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(submitButton);

    // Should call authenticated fetch with form data
    await waitFor(() => {
      expect(stableAuthenticatedFetch).toHaveBeenCalledWith(
        "/api/contact",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("John Doe")
        })
      );
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    // Mock slow API response
    stableAuthenticatedFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
    );

    render(<ContactForm />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: "John Doe" } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: "john@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/subject/i), { 
      target: { value: "Test Subject" } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: "Test message" } 
    });

    const submitButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it("handles API errors gracefully", async () => {
    // Mock API error
    stableAuthenticatedFetch.mockResolvedValue({ 
      ok: false, 
      status: 500,
      statusText: "Internal Server Error"
    });

    render(<ContactForm />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: "John Doe" } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: "john@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/subject/i), { 
      target: { value: "Test Subject" } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: "Test message" } 
    });

    const submitButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
    });

    // Button should be enabled again for retry
    expect(submitButton).toBeEnabled();
  });

  it("resets form after successful submission", async () => {
    render(<ContactForm />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: "John Doe" } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: "john@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/subject/i), { 
      target: { value: "Test Subject" } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: "Test message" } 
    });

    const submitButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(submitButton);

    // Wait for successful submission
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });

    // Form should be reset
    expect(screen.getByLabelText(/name/i)).toHaveValue("");
    expect(screen.getByLabelText(/email/i)).toHaveValue("");
    expect(screen.getByLabelText(/subject/i)).toHaveValue("");
    expect(screen.getByLabelText(/message/i)).toHaveValue("");
  });

  it("requires authentication for form submission", async () => {
    // Set unauthenticated user
    mockUser = null;
    mockAuthLoading = false;

    render(<ContactForm />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: "John Doe" } 
    });
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: "john@example.com" } 
    });
    fireEvent.change(screen.getByLabelText(/subject/i), { 
      target: { value: "Test Subject" } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: "Test message" } 
    });

    const submitButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(submitButton);

    // Should redirect to sign-in instead of submitting
    await waitFor(() => {
      expect(stableNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ 
          to: expect.stringContaining("/sign-in") 
        })
      );
    });

    // Should not call API
    expect(stableAuthenticatedFetch).not.toHaveBeenCalled();
  });
});
