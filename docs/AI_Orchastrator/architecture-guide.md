# Architecture Documentation Guide

## 📊 Documentation Organization

The architecture documentation is organized into **two main categories** to separate reusable patterns from project-specific implementations:

```
docs/AI_Orchastrator/
├── overview.md                          # Main project overview
├── architecture-guide.md                # This file
└── architecture/
    ├── README.md                        # Architecture index
    ├── core/                            # ⭐ Reusable patterns
    │   ├── README.md
    │   ├── authentication-system.md
    │   ├── authorization-roles.md
    │   ├── api-architecture.md
    │   ├── api-route-protection.md
    │   ├── security.md
    │   ├── csrf-protection.md
    │   ├── cors-configuration.md
    │   ├── rate-limiting.md
    │   ├── database-patterns.md
    │   ├── data-validation.md
    │   ├── caching-strategies.md
    │   ├── component-architecture.md
    │   ├── state-management.md
    │   ├── form-handling.md
    │   ├── testing-strategy.md
    │   ├── test-patterns.md
    │   ├── code-organization.md
    │   ├── typescript-patterns.md
    │   ├── seo-strategy.md
    │   ├── error-handling.md
    │   ├── environment-configuration.md
    │   ├── deployment-architecture.md
    │   └── monitoring-logging.md
    │
    └── domain/                          # 🎯 YourApp-specific
        ├── README.md
        ├── calculator-system.md
        ├── calculator-service.md
        ├── calculator-types.md
        ├── subscription-architecture.md
        ├── subscriptions-vs-orders.md
        ├── feature-gating.md
        ├── usage-tracking.md
        ├── order-system.md
        ├── order-processing.md
        ├── stripe-integration.md
        ├── payment-flows.md
        ├── checkout-implementation.md
        ├── firebase-integration.md
        ├── firebase-stripe-extension.md
        ├── custom-claims.md
        ├── account-management.md
        ├── profile-management.md
        ├── usage-dashboard.md
        ├── admin-dashboard.md
        ├── customer-management.md
        ├── subscription-analytics.md
        ├── order-analytics.md
        ├── landing-page.md
        ├── pricing-page.md
        ├── faq-system.md
        ├── contact-system.md
        ├── user-model.md
        ├── order-model.md
        ├── subscription-model.md
        └── calculator-usage-model.md
```

---

## ⭐ Core Architecture (Reusable)

**Purpose:** Patterns and practices that can be applied to **any project**

### Categories

#### 🔐 Authentication & Authorization
- Authentication patterns (JWT, OAuth, session-based)
- Role-based access control (RBAC)
- Permission systems
- Session management

#### 🌐 API & Backend
- REST API design patterns
- GraphQL patterns
- API route protection
- Error handling strategies
- Rate limiting
- API versioning

#### 💾 Data Management
- Database design patterns
- ORM best practices
- Caching strategies
- Data validation
- Pagination
- Search optimization

#### 🔒 Security
- Security headers
- CSRF protection
- CORS configuration
- XSS prevention
- SQL injection prevention
- Input sanitization

#### 🎨 Frontend Architecture
- Component design patterns
- State management (Context, Redux, Zustand)
- SEO strategy (metadata, structured data, sitemaps)
- Form handling
- Error boundaries
- Loading states
- Responsive design

#### 🏗️ Infrastructure
- Deployment strategies
- Environment configuration
- CI/CD pipelines
- Monitoring and logging
- Performance optimization

#### 🧪 Testing
- Unit testing patterns
- Integration testing
- E2E testing
- Mocking strategies
- Test organization

#### 📝 Development Practices
- Code organization
- TypeScript best practices
- Code review practices
- Documentation standards

---

## 🎯 Domain Architecture (YourApp-Specific)

**Purpose:** Implementation details specific to the **YourApp financial calculator SaaS**

### Categories

#### 🧮 Calculator System
- Mortgage calculator
- Loan calculator
- Investment calculator
- Retirement planner
- Calculation algorithms
- Result formatting
- Export functionality

#### 💳 Subscription Business Model
- Three-tier system (Basic, Pro, Enterprise)
- Feature gating by tier
- Usage limits
- Usage tracking
- Billing cycles (monthly/annual)
- Trial periods

#### 💰 Payment Processing
- Stripe integration
- Subscription checkout flow
- One-time order checkout
- Payment success handling
- Webhook processing
- Refund handling

#### 🔥 Firebase Integration
- Firebase Authentication
- Firestore for subscriptions
- Firebase Stripe Extension
- Custom claims (stripeRole)
- Real-time listeners

#### 👤 User Features
- Account management
- Profile editing
- Usage dashboard
- Calculation history
- Subscription management UI

#### 👨‍💼 Admin Features
- Admin dashboard
- Customer management
- Order management
- Subscription analytics
- Revenue reporting
- System health monitoring

#### 🌍 Public Features
- Landing page design
- Pricing page
- FAQ system
- Contact form
- Marketing pages

#### 📊 Data Models
- User model (PostgreSQL)
- Order model (PostgreSQL)
- Subscription model (Firestore)
- Calculator usage model (PostgreSQL)
- Contact message model

---

## 🔍 How to Use This Documentation

### Scenario 1: Starting a New Project

**Look at:** [`core/`](./architecture/core/)

You want to:
- Set up authentication → Read `core/authentication-system.md`
- Design API routes → Read `core/api-architecture.md`
- Implement security → Read `core/security.md`
- Plan database schema → Read `core/database-patterns.md`

### Scenario 2: Understanding YourApp

**Look at:** [`domain/`](./architecture/domain/)

You want to:
- Understand calculator logic → Read `domain/calculator-system.md`
- Learn subscription model → Read `domain/subscription-architecture.md`
- See payment flow → Read `domain/payment-flows.md`
- Understand data separation → Read `domain/subscriptions-vs-orders.md`

### Scenario 3: Working on a Feature

**Look at both:**

Example: Adding a new subscription tier
1. **Core:** Review `core/authorization-roles.md` for RBAC patterns
2. **Domain:** Check `domain/subscription-architecture.md` for current implementation
3. **Domain:** Update `domain/feature-gating.md` with new tier access rules

---

## 🎓 Key Architectural Decisions

### 1. Subscriptions vs Orders Separation

**Decision:** Keep subscriptions in Firestore and orders in PostgreSQL

**Rationale:**
- Subscriptions need real-time updates (Firestore)
- Orders are transactional records (PostgreSQL)
- No duplication, no sync issues
- Clear separation of concerns

**Documentation:** [`domain/subscriptions-vs-orders.md`](./architecture/domain/subscriptions-vs-orders.md)

### 2. Feature-Based Directory Structure

**Decision:** Organize by feature, not by technical layer

**Rationale:**
- Better scalability
- Easier to understand domain logic
- Clear feature boundaries
- Facilitates team ownership

**Documentation:** [`core/code-organization.md`](./architecture/core/code-organization.md)

### 3. Firebase Stripe Extension

**Decision:** Use Firebase Stripe Extension for subscription management

**Rationale:**
- Automatic webhook handling
- Real-time subscription sync
- Custom claims for access control
- Reduced backend complexity

**Documentation:** [`domain/firebase-stripe-extension.md`](./architecture/domain/firebase-stripe-extension.md)

---

## 📖 Documentation Standards

### File Naming
- Use kebab-case: `authentication-system.md`
- Be descriptive: `stripe-integration.md` not `stripe.md`
- Group related docs: `calculator-system.md`, `calculator-service.md`

### Document Structure
1. **Overview** - What is this?
2. **Why** - Why this approach?
3. **How** - Implementation details
4. **Examples** - Code samples
5. **Best Practices** - Tips and gotchas
6. **Related** - Links to related docs

### Code Examples
- Include real examples from codebase
- Show both good and bad patterns
- Add comments explaining key points
- Keep examples concise

---

## 🚀 Quick Start Guide

1. **New to the project?** Start with [`overview.md`](./overview.md)
2. **Understanding architecture?** Read [`architecture/README.md`](./architecture/README.md)
3. **Need reusable patterns?** Browse [`architecture/core/`](./architecture/core/)
4. **Working on features?** Check [`architecture/domain/`](./architecture/domain/)
5. **Specific question?** Use the search function or ask

---

## 🔗 External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [React Documentation](https://react.dev)

---

*Last Updated: December 2025*

