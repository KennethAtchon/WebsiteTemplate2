# AI Orchestrator Documentation Hub

Welcome to the documentation for this **Next.js SaaS template**. The template includes auth, subscriptions, payments, and admin out of the box. The **default implementation** is a financial calculator product (YourApp-style); you can keep it or replace it with your own core feature. See [Where to start coding](../where-to-start-coding.md) and [Template roadmap](../template-roadmap.md).

---

## 📚 Documentation Structure

```
AI_Orchastrator/
├── overview.md                  # 📖 Complete project overview
├── architecture-guide.md        # 🗺️ Documentation navigation guide
├── translation-workflow.md      # 🌐 Translation workflow guide
│
├── roles/                      # 🤖 AI Role Definitions
│   ├── code-organization-expert.md
│   ├── core-feature-swap-expert.md   # Swapping core feature (e.g. calculator → resumes)
│   ├── security-engineer.md
│   └── UI-design-expert.md
│
├── consider/                    # 💭 Architecture Considerations
│   ├── api-data-caching-swr-react-query.md
│   ├── graphql-architecture.md
│   └── automatic-translation-system.md
│
└── architecture/                # 🏗️ Architecture documentation
    ├── README.md               # Architecture index
    │
    ├── core/                   # ⭐ Reusable patterns
    │   ├── README.md
    │   └── [Pattern docs...]
    │
    └── domain/                 # 🎯 Template default (e.g. calculator)
        ├── README.md
        └── [Feature docs...]
```

---

## 🚀 Quick Start

### For New Team Members
1. Start with [**Overview**](./overview.md) - Get the big picture
2. Read [**Architecture Guide**](./architecture-guide.md) - Learn how docs are organized
3. Explore [**Domain Docs**](./architecture/domain/) - Understand the default (calculator) implementation

### For Developers
1. Review [**Core Patterns**](./architecture/core/) - Learn reusable best practices
2. Check [**Domain Implementation**](./architecture/domain/) - See how features work
3. Reference [**Architecture Index**](./architecture/) - Find specific docs

### For Architects
1. Read [**System Architecture**](./architecture/system-architecture.md) - High-level design
2. Study [**Core Patterns**](./architecture/core/) - Design patterns used
3. Review [**Key Decisions**](./architecture-guide.md#-key-architectural-decisions) - Why we made these choices

---

## 📖 Main Documents

### [Overview](./overview.md)
**Complete project overview including:**
- Project structure and directory breakdown
- Core features (calculators, subscriptions, orders, admin)
- Technology stack and dependencies
- Key systems and architecture
- API routes and authentication
- Database architecture
- Security and infrastructure

### [Architecture Guide](./architecture-guide.md)
**Documentation navigation guide:**
- How docs are organized (Core vs Domain)
- How to find what you need
- Key architectural decisions
- Documentation standards
- Quick reference for common scenarios

### [AI Roles](./roles/)
**Specialized AI role definitions:**
- [Code Organization Expert](./roles/code-organization-expert.md) - Code structure and organization patterns
- [Core Feature Swap Expert](./roles/core-feature-swap-expert.md) - Swap the default core feature to a different product (e.g. calculator → ResumeHelper)
- [Security Engineer](./roles/security-engineer.md) - Security best practices and implementation
- [UI Design Expert](./roles/UI-design-expert.md) - UI/UX design, React components, and visual aesthetics

### [Security Audit](./security-audit-tickets.md)
**Security audit findings and remediation tickets:**
- Comprehensive security audit based on security-engineer.md guidelines
- 15 security issues identified (3 Critical, 5 High, 3 Medium, 4 Low)
- Prioritized remediation recommendations
- Testing and validation requirements

### [Architecture Considerations](./consider/)
**Proposed features and architectural decisions:**
- [React Query Migration Guide](./consider/react-query-migration-guide.md) - Migrate from SWR to TanStack Query (setup, integration, file-by-file checklist)
- [GraphQL Architecture](./consider/graphql-architecture.md) - GraphQL integration options
- [Automatic Translation System](./consider/automatic-translation-system.md) - i18n and multi-language support
- [Testing Implementation Plan](./consider/testing-implementation-plan.md) - Comprehensive plan for adding unit and integration tests
- [Production Readiness Checklist](./consider/production-readiness.md) - Pre-launch checklist and requirements

### [Translation Workflow](./translation-workflow.md)
**Manual translation workflow for adding i18n to source files:**
- Step-by-step process for translating `.ts` and `.tsx` files
- Using the `inject-translations` script
- Handling failed translations and manual fixes
- Best practices and common issues

---

## 🏗️ Architecture Documentation

### [Architecture Index](./architecture/)
Central hub for all architecture documentation with links to both Core and Domain docs.

### [Core Architecture](./architecture/core/)
**Reusable patterns applicable to any project:**
- Authentication & Authorization
- API Design & Security
- Database Patterns
- Component Architecture
- Testing Strategies
- Infrastructure & Deployment
- Error Handling & Monitoring

### [Domain Architecture](./architecture/domain/)
**YourApp-specific implementations:**
- Calculator System (mortgage, loan, investment, retirement)
- Subscription Business Model (3 tiers, usage limits)
- Payment Processing (Stripe integration)
- Firebase Integration (Auth, Firestore, Custom Claims)
- Admin & User Features
- Public Pages & Marketing
- Data Models

---

## 🔑 Critical Documents

### 1. [Subscriptions vs Orders](../../ARCHITECTURE_SUBSCRIPTIONS_VS_ORDERS.md)
**Must read:** Explains the critical architectural decision to separate subscriptions (Firestore) from orders (PostgreSQL).

### 2. [Subscription Architecture](./architecture/domain/subscription-architecture.md)
How the three-tier subscription model (Basic, Pro, Enterprise) works with feature gating and usage limits.

### 3. [Calculator System](./architecture/domain/calculator-system.md)
Implementation details for the financial calculators (mortgage, loan, investment, retirement).

### 4. [Payment Flows](./architecture/domain/payment-flows.md)
Complete payment flow diagrams for both subscription and one-time order checkouts.

### 5. [Firebase Integration](./architecture/domain/firebase-integration.md)
How Firebase Auth, Firestore, and the Stripe Extension work together.

### 6. [Template Roadmap](../template-roadmap.md)
Plan to make this repo a **topic-agnostic SaaS template**: branding, generic core feature, usage model, permissions, routes, i18n, and docs. Use this when changing the product topic (e.g. from calculator to another subject).

---

## 🎯 Use Cases

### "I need to understand the whole project"
→ Start with [**Overview**](./overview.md)

### "I'm building a similar SaaS application"
→ Study [**Core Architecture**](./architecture/core/)

### "I'm working on the default feature or my own core feature"
→ Check [**Domain Architecture**](./architecture/domain/) and [**Where to start coding**](../where-to-start-coding.md)

### "I need to find a specific document"
→ Use [**Architecture Guide**](./architecture-guide.md)

### "I want to understand architectural decisions"
→ Read [**Subscriptions vs Orders**](../../ARCHITECTURE_SUBSCRIPTIONS_VS_ORDERS.md)

### "I want to make this a template or change the product topic"
→ Follow [**Template Roadmap**](../template-roadmap.md)

### "I need a map of the whole project and what to change"
→ Read the [**Template Guide**](../TEMPLATE_GUIDE.md)

---

## 📊 Project Stats

- **Framework:** Next.js 15.3.1 with App Router
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** Firebase Authentication
- **Payments:** Stripe with Firebase Extension
- **UI:** React 19, Tailwind CSS 4, Radix UI
- **Testing:** Vitest, Playwright

---

## 🔗 External Links

- [Project README](../../README.md) - Getting started, development setup
- [Template Guide](../TEMPLATE_GUIDE.md) - Full project map and "make it yours" reference
- [Main Codebase](../../project/) - Source code
- [Tests](../../project/__tests__/) - Test files
- [Scripts](../../project/scripts/README.md) - Bulk codebase transformation scripts and guidelines

---

## 📝 Documentation Philosophy

### Core vs Domain

**Core = Reusable**  
Patterns and practices that work for any project. Technology-agnostic where possible.

**Domain = Template default / your product**  
Default implementation (e.g. calculator) or your own core feature. Implementation-focused.

### Why This Matters

- **Reusability:** Core patterns can be applied to future projects
- **Clarity:** Domain docs focus on YourApp-specific details
- **Maintainability:** Clear separation makes updates easier
- **Onboarding:** New team members can learn patterns and specifics separately

---

## 🤝 Contributing

When adding documentation:

1. **Determine category:** Core (reusable) or Domain (template default / your product)
2. **Create in appropriate folder:** `architecture/core/` or `architecture/domain/`
3. **Update indexes:** Add links to relevant README files
4. **Follow standards:** Use established naming and structure conventions
5. **Link related docs:** Create connections between related documents

See [Architecture Guide](./architecture-guide.md) for detailed standards.

---

## 🔍 Search Tips

- Use descriptive file names (they're searchable)
- Check README files in each folder first
- Follow links between related documents
- Use your IDE's global search for keywords

---

*This documentation is maintained by the development team and updated as the project evolves.*

**Last Updated:** December 2025

