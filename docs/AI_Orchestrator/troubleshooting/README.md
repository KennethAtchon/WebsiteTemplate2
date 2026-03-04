# Troubleshooting Guide

This directory contains troubleshooting guides for common issues in the YourApp application.

## Available Guides

### Performance Issues

- **[Lighthouse Performance Issues](./lighthouse-performance-issues.md)**
  - Problem: Performance scores below 0.8, high FCP/LCP times
  - Solution: Comprehensive guide on Next.js/React optimization and specific fixes for identified issues
  - Common causes: Large bundles, unoptimized images, missing code splitting, unnecessary client components

### Subscription Issues

- **[Subscription Cancellation During Trial](./subscription-cancellation-during-trial.md)**
  - Problem: Understanding if canceled subscriptions during trial are reflected in admin dashboard
  - Solution: Detailed explanation of cancellation flow, status tracking, and verification steps
  - Common causes: Webhook sync delays, Firebase Extension configuration issues

- **[Missing stripeRole Custom Claim](./stripe-role-missing.md)**
  - Problem: Subscription is active in Stripe and Firestore, but `stripeRole` claim is missing from Firebase ID token
  - Solution: Add `firebaseRole` metadata to Stripe products
  - Common causes: Missing metadata, Extension not configured, token not refreshed

- **[Portal Link "No portal URL in response"](./portal-link-no-url.md)**
  - Problem: Error creating Stripe Customer Portal link - response doesn't contain expected URL
  - Solution: Enhanced response parsing and logging to handle multiple response formats
  - Common causes: Different response format from Firebase Extension, authentication issues

### UI/Design System Issues

- **[UI Design System Principles](./ui-design-system-principles.md)**
  - Problem: Inconsistent spacing, typography, and component patterns across the UI system
  - Solution: Comprehensive guide on creating design tokens, establishing design system rules, and refactoring components
  - Common causes: No unified spacing system, missing typography scale, undocumented component patterns, lack of design system documentation

## How to Use

1. Identify the issue you're experiencing
2. Read the relevant troubleshooting guide
3. Follow the step-by-step solution
4. Use the verification checklist to confirm the fix

## Contributing

When adding new troubleshooting guides:

1. Create a new markdown file in this directory
2. Use descriptive filenames (e.g., `issue-name.md`)
3. Follow the existing format:
   - Problem description
   - Root cause
   - Step-by-step solution
   - Verification checklist
   - Common issues and solutions
4. Update this README with a link to the new guide

---

*For architecture documentation, see [../architecture/](../architecture/)*

