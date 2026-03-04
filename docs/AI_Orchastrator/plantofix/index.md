# Plantofix - Planned Fixes & Refactors

This directory contains comprehensive plans for major refactors and fixes that need to be implemented.

## Active Plans

### [Subscription Portal-Only Refactor](./subscription-portal-only-refactor.md)
**Status:** 🟡 Planning  
**Priority:** High  
**Description:** Remove all upgrade/downgrade logic from pricing pages. All subscription plan changes must go through Stripe Customer Portal. Pricing page should only be used for NEW subscriptions.

**Key Changes:**
- Remove upgrade/downgrade detection from `PricingCard`
- Remove subscription detection from `pricing-interactive`
- Remove "Change Plan" and "Upgrade Plan" buttons from subscription management
- Add checkout protection to prevent duplicate subscriptions
- Update all upgrade prompts to use portal for existing subscribers

**Impact:** Prevents duplicate subscriptions, ensures proper subscription modification, centralizes subscription management.

---

## How to Use These Plans

1. **Review the plan** - Read through the comprehensive markdown document
2. **Follow the checklist** - Each plan has a detailed implementation checklist
3. **Test thoroughly** - Plans include testing strategies
4. **Update status** - Mark items complete as you go
5. **Document changes** - Update related documentation as specified

---

*Last Updated: January 2026*
