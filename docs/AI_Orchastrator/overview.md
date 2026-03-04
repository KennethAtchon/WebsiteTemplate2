# Project Overview

## Introduction

This is a **Next.js 15 SaaS template** with auth, subscriptions, payments, and admin already set up. The **default implementation** is a professional financial calculator product (YourApp-style: mortgage, loan, investment, retirement). You can keep it or replace it with your own core feature—see [Where to start coding](../where-to-start-coding.md) and [Template roadmap](../template-roadmap.md).

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, PostgreSQL, Firebase, Stripe  
**Architecture:** Full-stack SaaS with clean separation between subscriptions and orders; template-agnostic usage and permissions

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Core Features](#core-features)
3. [Architecture Overview](#architecture-overview)
4. [Technology Stack](#technology-stack)
5. [Directory Breakdown](#directory-breakdown)
6. [Key Systems](#key-systems)
7. [API Routes](#api-routes)
8. [Authentication & Authorization](#authentication--authorization)
9. [Payment Processing](#payment-processing)
10. [Database Architecture](#database-architecture)
11. [Security & Infrastructure](#security--infrastructure)
12. [Development & Testing](#development--testing)

---

## Project Structure

```
project/
├── app/                    # Next.js App Router (pages & API routes)
├── features/               # Feature modules (domain-driven)
├── shared/                 # Shared components, utilities, services
├── infrastructure/         # Database, Prisma schema
├── public/                 # Static assets
└── __tests__/              # Test files
```

For detailed architecture documentation, see:
- **[Core Architecture](./architecture/core/)** - Reusable patterns for any project
- **[Domain Architecture](./architecture/domain/)** - Template default implementation (e.g. calculator)
- [Application Architecture](./architecture/application-architecture.md)
- [Directory Structure](./architecture/directory-structure.md)

---

## Core Features

### 1. Financial Calculators
- **Mortgage Calculator**: Monthly payments, amortization schedules, PMI calculations *(Free - no subscription required)*
- **Loan Calculator**: Fixed/variable rates, payment optimization, early payoff *(Basic tier and above)*
- **Investment Calculator**: Compound interest, growth projections, ROI analysis *(Pro tier and above)*
- **Retirement Planner**: Savings goals, income projections, withdrawal strategies *(Enterprise tier only)*

**Permission System:** Centralized permission checking via `calculator-permissions.ts` - single source of truth for calculator access rules.

**Documentation:**
- [Calculator System](./architecture/domain/calculator-system.md)
- [Calculator Service Implementation](./architecture/domain/calculator-service.md)

### 2. Subscription Management
- Three-tier subscription model (Basic, Pro, Enterprise)
- Monthly/annual billing cycles
- Usage limits and feature gating
- Stripe integration for recurring payments
- Customer portal for subscription management

**Documentation:**
- [Subscription Architecture](./architecture/domain/subscription-architecture.md)
- [Subscriptions vs Orders](./architecture/domain/subscriptions-vs-orders.md)

### 3. Order Management
- One-time purchase tracking
- Order history and details
- Revenue tracking
- Admin order management

**Documentation:**
- [Order System](./architecture/domain/order-system.md)
- [Subscriptions vs Orders](./architecture/domain/subscriptions-vs-orders.md)

### 4. User Account Management
- Profile editing
- Usage dashboard
- Calculation history
- Subscription management interface

**Documentation:**
- [Account Features](./architecture/domain/account-management.md)

### 5. Admin Dashboard
- Business metrics and analytics
- Customer management
- Order management
- Subscription analytics
- Contact message management
- Developer tools

**Documentation:**
- [Admin Dashboard](./architecture/domain/admin-dashboard.md)

### 6. Public Pages
- Landing page with hero section
- Features page
- Pricing page
- FAQ page
- Contact page
- About, Privacy, Terms pages

**Documentation:**
- [Landing Page](./architecture/domain/landing-page.md)
- [Pricing Page](./architecture/domain/pricing-page.md)
- [FAQ System](./architecture/domain/faq-system.md)
- [Contact System](./architecture/domain/contact-system.md)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Public Pages │  │ Customer App │  │ Admin Panel  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  API Routes (Next.js)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Customer │  │  Admin   │  │  Public  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │  Firestore   │ │    Stripe    │
│   (Prisma)   │ │  (Firebase)  │ │   Payments   │
│              │ │              │ │              │
│ - Users      │ │ - Subscriptions│ - Checkout  │
│ - Orders     │ │ - Custom Claims│ - Webhooks  │
│ - Usage      │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

**Documentation:**
- [System Architecture](./architecture/system-architecture.md)
- [Data Flow](./architecture/data-flow.md)
- [Core Patterns](./architecture/core/) - Reusable architectural patterns

---

## Technology Stack

### Frontend
- **Framework:** Next.js 15.3.1 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4.1.6
- **UI Components:** Radix UI primitives
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** Firebase Auth
- **File Storage:** AWS S3 / Cloudflare R2
- **Email:** Resend
- **Caching:** Redis (ioredis)

### Payments & Subscriptions
- **Payment Processor:** Stripe
- **Subscription Management:** Firebase Stripe Extension
- **Subscription Storage:** Firestore

### Development Tools
- **TypeScript:** 5.x
- **Testing:** Vitest, Playwright
- **Linting:** ESLint
- **Package Manager:** bun

**Documentation:**
- [Technology Stack Details](./architecture/technology-stack.md)
- [Dependencies & Configuration](./architecture/dependencies.md)
- [Environment Configuration](./architecture/core/environment-configuration.md)

---

## Directory Breakdown

### `/app` - Next.js Application
Contains all pages and API routes organized by route groups:
- `(customer)` - Customer-facing pages (auth, main app)
- `(public)` - Public marketing pages
- `admin` - Admin dashboard pages
- `api` - API route handlers

**Documentation:**
- [App Directory Structure](./architecture/app-directory.md)
- [API Routes](./architecture/api-routes.md)
- [Code Organization](./architecture/core/code-organization.md)

### `/features` - Feature Modules
Domain-driven feature modules with components, hooks, services, and types:
- `account` - User account management
- `admin` - Admin dashboard components
- `auth` - Authentication components and services
- `calculator` - Calculator logic and hooks
- `contact` - Contact form components
- `customers` - Customer types
- `faq` - FAQ components and data
- `orders` - Order types
- `payments` - Payment processing components
- `subscriptions` - Subscription hooks and types

**Documentation:**
- [Features Directory](./architecture/features-directory.md)
- [Domain Features](./architecture/domain/)

### `/shared` - Shared Resources
Reusable components, utilities, services, and constants:
- `components` - Shared UI components (calculator, layout, marketing, saas, ui)
- `constants` - App-wide constants
- `contexts` - React Context providers (App Context for unified auth/profile state)
- `hooks` - Shared React hooks
- `middleware` - API route protection
- `services` - External service integrations (API, CSRF, DB, Email, Firebase, Rate Limit, SEO, Session, Storage, Timezone)
- `types` - Shared TypeScript types
- `utils` - Utility functions:
  - `api` - API response helpers, timezone headers
  - `config` - Centralized environment variable access
  - `debug` - DebugLogger for development logging
  - `error-handling` - API error wrapper, global error handler
  - `helpers` - Date, pagination, general utilities
  - `permissions` - Calculator permissions and access control
  - `security` - PII sanitization, encryption
  - `system` - System logger, app initialization, web vitals
  - `type-guards` - TypeScript type guards
  - `validation` - API, checkout, contact, data, file, search validation

**Documentation:**
- [Shared Resources](./architecture/shared-resources.md)
- [Component Library](./architecture/component-library.md)
- [Component Architecture](./architecture/core/component-architecture.md)

### `/infrastructure` - Infrastructure
Database schema and configuration:
- `database/prisma` - Prisma schema and migrations

**Documentation:**
- [Database Schema](./architecture/database-schema.md)
- [Prisma Configuration](./architecture/prisma-config.md)
- [Database Patterns](./architecture/core/database-patterns.md)

### `/public` - Static Assets
Static files, images, and email templates

---

## Key Systems

### 1. Authentication System
- Firebase Authentication (email/password, Google OAuth)
- Role-based access control (user, admin)
- Custom claims for subscription tiers
- Auth guards and middleware

**Documentation:**
- [Authentication System](./architecture/core/authentication-system.md) - Reusable auth patterns
- [Firebase Integration](./architecture/domain/firebase-integration.md) - Project-specific implementation

### 2. Subscription System
- Three-tier model (Basic, Pro, Enterprise)
- Stripe Checkout integration
- Firebase Stripe Extension for automatic sync
- Custom claims for access control
- Usage limits and feature gating

**Documentation:**
- [Subscription System](./architecture/domain/subscription-architecture.md)
- [Stripe Integration](./architecture/domain/stripe-integration.md)

### 3. Payment Processing
- Stripe Checkout for subscriptions
- Stripe Checkout for one-time orders
- Webhook handling
- Payment success/failure flows

**Documentation:**
- [Payment Processing](./architecture/payment-processing.md)
- [Payment Flows](./architecture/domain/payment-flows.md)
- [Stripe Integration](./architecture/domain/stripe-integration.md)

### 4. Calculator Engine
- Four calculation types (mortgage, loan, investment, retirement)
- Usage tracking and limits
- Calculation history
- Export functionality (PDF, Excel, CSV)

**Documentation:**
- [Calculator Engine](./architecture/domain/calculator-system.md)
- [Calculation Algorithms](./architecture/domain/calculator-service.md)

### 5. Admin System
- Dashboard with metrics
- Customer management
- Order management
- Subscription analytics
- Contact message management

**Documentation:**
- [Admin Dashboard](./architecture/domain/admin-dashboard.md)
- [Admin Features](./architecture/domain/)

### 6. Security & Infrastructure
- CSRF protection
- **Comprehensive Rate Limiting** - Redis-based with IP blocking support
- CORS configuration
- Security headers (CSP, HSTS, etc.)
- **PII Sanitization** - GDPR-compliant data protection in logs and responses
- **System Logger** - Always-on production monitoring
- **Database Performance Monitoring** - Query performance tracking
- Error monitoring and global error handling
- Web vitals tracking
- **App Initialization** - Global error handlers and process monitoring

**Documentation:**
- [Security Implementation](./architecture/core/security.md) - Security best practices including PII sanitization
- [CSRF Protection](./architecture/core/csrf-protection.md)
- [Rate Limiting](./architecture/core/rate-limiting.md) - Comprehensive rate limiter with IP blocking
- [Error Handling](./architecture/core/error-handling.md) - API error wrapper and global error handler
- [Logging & Monitoring](./architecture/core/logging-monitoring.md) - DebugLogger and SystemLogger
- [Infrastructure Setup](./architecture/infrastructure.md)

---

## API Routes

### Customer APIs
- `/api/customer/orders` - Order management (GET, POST)
- `/api/customer/orders/[orderId]` - Get specific order
- `/api/customer/orders/by-session` - Get order by Stripe session ID
- `/api/customer/orders/create` - Create new order
- `/api/customer/orders/total-revenue` - Get customer's total revenue
- `/api/customer/profile` - Profile management (GET, PUT)
- `/api/customer/fix-stripe-customer` - Fix invalid Stripe customer IDs (auto-called on checkout errors)

### Admin APIs
- `/api/admin/customers` - Customer management (GET, PUT)
- `/api/admin/customers/clear-stripe-ids` - Clear Stripe customer IDs
- `/api/admin/orders` - Order management (GET)
- `/api/admin/orders/[id]` - Get/update specific order
- `/api/admin/subscriptions` - Subscription management (GET)
- `/api/admin/subscriptions/[id]` - Get specific subscription
- `/api/admin/subscriptions/analytics` - Subscription analytics
- `/api/admin/analytics` - Business analytics
- `/api/admin/database/health` - Database health monitoring
- `/api/admin/schema` - Database schema introspection
- `/api/admin/sync-firebase` - Sync Firebase data
- `/api/admin/verify` - Admin verification

### Calculator APIs
- `/api/calculator/calculate` - Perform calculations (POST)
- `/api/calculator/history` - Calculation history (GET)
- `/api/calculator/usage` - Usage statistics (GET)
- `/api/calculator/export` - Export calculations (GET)
- `/api/calculator/types` - Get available calculator types (GET)

### Subscription APIs
- `/api/subscriptions/checkout` - Create checkout session (POST)
- `/api/subscriptions/portal-link` - Customer portal access (POST)
- `/api/subscriptions/current` - Get current subscription (GET)

### Public APIs
- `/api/shared/contact-messages` - Contact form submission (POST)
- `/api/shared/upload` - File upload (POST, DELETE)
- `/api/shared/emails` - Email management
- `/api/public/system` - System status check

### System APIs
- `/api/health` - Health check endpoint
- `/api/health/error-monitoring` - Error metrics
- `/api/live` - Liveness probe
- `/api/ready` - Readiness probe
- `/api/csrf` - CSRF token generation

### Analytics APIs
- `/api/analytics/form-completion` - Form completion tracking
- `/api/analytics/form-progress` - Form progress tracking
- `/api/analytics/search-performance` - Search performance metrics
- `/api/analytics/web-vitals` - Web vitals tracking

### User APIs
- `/api/users` - User management (GET)
- `/api/users/customers-count` - Get customer count
- `/api/users/delete-account` - Delete user account

**Documentation:**
- [API Routes Reference](./architecture/api-routes-reference.md)
- [API Architecture](./architecture/core/api-architecture.md) - API design patterns
- [API Route Protection](./architecture/core/api-route-protection.md)
- [API Authentication](./architecture/api-authentication.md)

---

## Authentication & Authorization

### Authentication Flow
1. User signs in via Firebase Auth (email/password or Google)
2. Firebase returns user with ID token
3. Server validates token and sets custom claims
4. Custom claims include `stripeRole` for subscription tier
5. Role-based access control enforced via middleware

### Authorization Levels
- **Public:** No authentication required
- **User:** Authenticated users with active subscription
- **Admin:** Users with `role: "admin"` in database

**Documentation:**
- [Authentication Flow](./architecture/authentication-flow.md)
- [Authorization & Roles](./architecture/core/authorization-roles.md) - RBAC patterns

---

## Payment Processing

### Subscription Payments
1. User selects subscription tier
2. Checkout session created via Stripe
3. Firebase Extension syncs subscription to Firestore
4. Custom claims updated with subscription tier
5. Access granted based on tier

### One-Time Orders
1. User completes one-time purchase
2. Stripe Checkout processes payment
3. Order created in PostgreSQL via API
4. Confirmation email sent

**Documentation:**
- [Payment Flows](./architecture/domain/payment-flows.md)
- [Stripe Integration Details](./architecture/domain/stripe-integration.md)
- [Checkout Implementation](./architecture/domain/checkout-implementation.md)

---

## Database Architecture

### PostgreSQL (Prisma)
- **Users:** User accounts, profiles, roles
- **Orders:** One-time purchases
- **CalculatorUsage:** Calculation history and usage tracking
- **ContactMessage:** Contact form submissions

### Firestore (Firebase)
- **Subscriptions:** Recurring subscription data (managed by Firebase Extension)
- **Checkout Sessions:** Temporary checkout session data

**Key Architectural Decision:** Clean separation between subscriptions (Firestore) and orders (PostgreSQL) to prevent duplication and sync issues.

**Documentation:**
- [Database Schema](./architecture/database-schema.md)
- [Database Patterns](./architecture/core/database-patterns.md) - Reusable patterns
- [Subscriptions vs Orders](./architecture/domain/subscriptions-vs-orders.md)
- [Data Models](./architecture/domain/)

---

## Security & Infrastructure

### Security Features
- CSRF protection on API routes
- **Comprehensive Rate Limiting** - Redis-based with IP blocking and endpoint-specific limits
- CORS with origin validation
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **PII Sanitization** - Automatic detection and redaction of sensitive data
- Input validation (Zod schemas)
- SQL injection prevention (Prisma)
- XSS protection (DOMPurify)
- **API Error Wrapper** - Standardized error handling for all API routes
- **Global Error Handler** - Process-level error catching and reporting

### Infrastructure Services
- **File Storage:** AWS S3 / Cloudflare R2 (R2Storage service)
- **Email:** Resend
- **Caching:** Redis (with health monitoring)
- **Monitoring:** 
  - System Logger for production monitoring
  - Debug Logger for development
  - Database performance monitoring
  - Memory and Redis health checks
  - Web vitals tracking
- **Timezone Service** - Comprehensive IANA timezone handling
- **Environment Configuration** - Centralized, type-safe env variable access

**Documentation:**
- [Security Implementation](./architecture/core/security.md)
- [CSRF Protection](./architecture/core/csrf-protection.md)
- [CORS Configuration](./architecture/core/cors-configuration.md)
- [Infrastructure Services](./architecture/infrastructure-services.md)

---

## Development & Testing

### Development Setup
```bash
cd project
bun install
bun run db:generate
bun run db:migrate
bun dev
```

### Testing
- **Unit Tests:** Vitest
- **Integration Tests:** Vitest + Supertest
- **E2E Tests:** Playwright

### Database Management
- Prisma migrations
- Database studio: `bun run db:studio`

**Documentation:**
- [Development Setup](./architecture/development-setup.md)
- [Testing Strategy](./architecture/core/testing-strategy.md) - Testing patterns
- [SEO Strategy](./architecture/core/seo-strategy.md) - SEO metadata, structured data, and search optimization
- [Database Migrations](./architecture/database-migrations.md)

---

## Troubleshooting

Common issues and solutions:
- [Missing stripeRole Custom Claim](./troubleshooting/stripe-role-missing.md) - Subscription working but `stripeRole` claim not appearing

## Additional Resources

### Core Architecture (Reusable Patterns)
**These patterns can be applied to any project:**
- [Authentication System](./architecture/core/authentication-system.md)
- [Authorization & Roles](./architecture/core/authorization-roles.md)
- [API Architecture](./architecture/core/api-architecture.md)
- [API Route Protection](./architecture/core/api-route-protection.md)
- [Security Implementation](./architecture/core/security.md)
- [CSRF Protection](./architecture/core/csrf-protection.md)
- [Rate Limiting](./architecture/core/rate-limiting.md)
- [Database Patterns](./architecture/core/database-patterns.md)
- [Component Architecture](./architecture/core/component-architecture.md)
- [Testing Strategy](./architecture/core/testing-strategy.md)
- [Code Organization](./architecture/core/code-organization.md)
- [Error Handling](./architecture/core/error-handling.md)

### Domain-Specific Documentation (YourApp)
**Features specific to this financial calculator SaaS:**
- [Calculator System](./architecture/domain/calculator-system.md)
- [Calculator Service](./architecture/domain/calculator-service.md)
- [Subscription Architecture](./architecture/domain/subscription-architecture.md)
- [Subscriptions vs Orders](./architecture/domain/subscriptions-vs-orders.md)
- [Order System](./architecture/domain/order-system.md)
- [Admin Dashboard](./architecture/domain/admin-dashboard.md)
- [Firebase Integration](./architecture/domain/firebase-integration.md)
- [Stripe Integration](./architecture/domain/stripe-integration.md)
- [Payment Flows](./architecture/domain/payment-flows.md)
- [Feature Gating](./architecture/domain/feature-gating.md)
- [Usage Tracking](./architecture/domain/usage-tracking.md)

### General Architecture
- [Application Architecture](./architecture/application-architecture.md)
- [System Architecture](./architecture/system-architecture.md)
- [Data Flow Diagrams](./architecture/data-flow.md)
- [Technology Stack](./architecture/technology-stack.md)

---

## Quick Links

### Documentation Navigation
- [Architecture Guide](./architecture-guide.md) - How to navigate the documentation
- [Core Architecture](./architecture/core/) - Reusable patterns for any project
- [Domain Architecture](./architecture/domain/) - YourApp-specific features

### Important Documents
- [Main README](../../README.md) - Getting started
- [Architecture Index](./architecture/) - All architecture docs
- [Subscription vs Orders](../../ARCHITECTURE_SUBSCRIPTIONS_VS_ORDERS.md) - Critical architectural decision

---

*Last Updated: Generated automatically from codebase analysis*

