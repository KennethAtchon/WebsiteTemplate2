# Architecture Documentation

This directory contains comprehensive architectural documentation for the YourApp financial calculator SaaS application, organized into **Core** (reusable patterns) and **Domain** (project-specific) sections.

---

## 📁 Directory Structure

```
architecture/
├── core/               # Reusable architectural patterns
│   └── README.md      # Core patterns that apply to any project
├── domain/            # YourApp-specific implementations
│   └── README.md      # Domain features and business logic
└── README.md          # This file
```

---

## 🔧 Core Architecture

**Location:** [`./core/`](./core/)

Reusable architectural patterns and best practices that can be applied to **any project**, regardless of domain or business logic.

### What's in Core?
- Authentication & authorization patterns
- API design and security
- Database patterns and strategies
- Component architecture
- Testing strategies
- Error handling
- Security implementations
- Infrastructure patterns

### When to use Core?
Reference core documentation when:
- Starting a new project
- Implementing common patterns
- Looking for best practices
- Designing system architecture
- Setting up security measures

**[→ Browse Core Architecture](./core/)**

---

## 🎯 Domain Architecture

**Location:** [`./domain/`](./domain/)

Project-specific architectural documentation for the **YourApp financial calculator SaaS application**.

### What's in Domain?
- Financial calculator system
- Subscription business model
- Stripe payment integration
- Firebase integration
- Admin dashboard features
- User account features
- Usage tracking and limits
- Feature gating

### When to use Domain?
Reference domain documentation when:
- Understanding YourApp-specific features
- Working on calculator functionality
- Implementing subscription features
- Integrating with Stripe or Firebase
- Building admin or user features

**[→ Browse Domain Architecture](./domain/)**

---

## 🗺️ Quick Navigation

### Core Patterns (Reusable)
| Pattern | Description |
|---------|-------------|
| [Authentication](./core/authentication.md) | Auth patterns and flows with Firebase |
| [API Architecture](./core/api.md) | REST API design patterns and protection |
| [Security](./core/security.md) | Security best practices (CSRF, CORS, rate limiting) |
| [Database](./core/database.md) | Data modeling strategies with Prisma |
| [Code Structure](./core/code-structure.md) | Project organization and component patterns |
| [Performance](./core/performance.md) | Caching strategies (Redis, Next.js, SWR) |
| [Error Handling](./core/error-handling.md) | Error handling and recovery patterns |
| [Logging & Monitoring](./core/logging-monitoring.md) | Logging strategies and observability |

### Domain Features (YourApp-Specific)
| Feature | Description |
|---------|-------------|
| [Business Model](./domain/business-model.md) | Subscription tiers, pricing, payment flows |
| [Calculator System](./domain/calculator-system.md) | Financial calculator implementation |
| [Account Management](./domain/account-management.md) | Customer account features |
| [Admin Dashboard](./domain/admin-dashboard.md) | Admin panel features and analytics |

---

## 📚 Documentation Philosophy

### Core vs Domain

**Core = Reusable**
- Technology-agnostic where possible
- Framework-independent concepts
- Applicable to multiple projects
- Best practice oriented
- Pattern-focused

**Domain = Specific**
- YourApp business logic
- Implementation details
- Integration specifics
- Feature workflows
- Use-case driven

### Example

**Core:** How to implement authentication with JWT tokens  
**Domain:** How YourApp uses Firebase Auth with custom claims for subscription tiers

**Core:** How to design a subscription-based SaaS architecture  
**Domain:** How YourApp implements three tiers (Basic, Pro, Enterprise) with specific features

---

## 🔗 Related Documentation

- [Main Overview](../overview.md) - Project overview and table of contents
- [Project README](../../../README.md) - Getting started guide
- [Subscriptions vs Orders](../../ARCHITECTURE_SUBSCRIPTIONS_VS_ORDERS.md) - Critical architectural document

---

## 📝 Contributing to Documentation

When adding new documentation:

1. **Determine if it's Core or Domain**
   - Can this be used in other projects? → Core
   - Is this specific to YourApp? → Domain

2. **Place in appropriate folder**
   - Core: `./core/your-document.md`
   - Domain: `./domain/your-document.md`

3. **Update relevant README files**
   - Add link to [Core README](./core/README.md) or [Domain README](./domain/README.md)
   - Update main [Overview](../overview.md) if needed

4. **Follow naming conventions**
   - Use kebab-case: `authentication-system.md`
   - Be descriptive: `stripe-integration.md` not `stripe.md`
   - Group related docs: `calculator-system.md`, `calculator-service.md`

---

*Last Updated: December 2025*

