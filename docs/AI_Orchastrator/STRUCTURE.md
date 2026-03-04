# Documentation Structure

## Complete Folder Hierarchy

```
docs/AI_Orchastrator/
│
├── 📄 index.md                          # Documentation hub (START HERE)
├── 📄 overview.md                       # Complete project overview
├── 📄 architecture-guide.md             # How to navigate documentation
├── 📄 STRUCTURE.md                      # This file
│
├── 📁 roles/                            # 🤖 AI Role Definitions
│   ├── code-organization-expert.md      # Code organization specialist
│   ├── security-engineer.md             # Security expert
│   └── UI-design-expert.md              # UI/UX design expert
│
└── 📁 architecture/
    │
    ├── 📄 README.md                     # Architecture index
    │
    ├── 📁 core/                         # ⭐ REUSABLE PATTERNS
    │   │                                # Can be used in ANY project
    │   ├── 📄 README.md
    │   │
    │   ├── 🔐 Authentication & Authorization
    │   │   ├── authentication-system.md
    │   │   ├── authorization-roles.md
    │   │   └── session-management.md
    │   │
    │   ├── 🌐 API & Backend
    │   │   ├── api-architecture.md
    │   │   ├── api-route-protection.md
    │   │   ├── error-handling.md
    │   │   └── rate-limiting.md
    │   │
    │   ├── 💾 Data Management
    │   │   ├── database-patterns.md
    │   │   ├── data-validation.md
    │   │   └── caching-strategies.md
    │   │
    │   ├── 🔒 Security
    │   │   ├── security.md
    │   │   ├── csrf-protection.md
    │   │   └── cors-configuration.md
    │   │
    │   ├── 🎨 Frontend
    │   │   ├── component-architecture.md
    │   │   ├── state-management.md
    │   │   ├── seo-strategy.md
    │   │   └── form-handling.md
    │   │
    │   ├── 🏗️ Infrastructure
    │   │   ├── deployment-architecture.md
    │   │   ├── environment-configuration.md
    │   │   └── monitoring-logging.md
    │   │
    │   ├── 🧪 Testing
    │   │   ├── testing-strategy.md
    │   │   └── test-patterns.md
    │   │
    │   └── 📝 Development
    │       ├── code-organization.md
    │       └── typescript-patterns.md
    │
    └── 📁 domain/                       # 🎯 CALCPRO-SPECIFIC
        │                                # Project business logic
        ├── 📄 README.md
        │
        ├── 🧮 Calculator System
        │   ├── calculator-system.md
        │   ├── calculator-service.md
        │   └── calculator-types.md
        │
        ├── 💳 Subscription Model
        │   ├── subscription-architecture.md
        │   ├── subscriptions-vs-orders.md
        │   ├── feature-gating.md
        │   └── usage-tracking.md
        │
        ├── 🛒 Order Management
        │   ├── order-system.md
        │   └── order-processing.md
        │
        ├── 💰 Payment Processing
        │   ├── stripe-integration.md
        │   ├── payment-flows.md
        │   └── checkout-implementation.md
        │
        ├── 🔥 Firebase Integration
        │   ├── firebase-integration.md
        │   ├── firebase-stripe-extension.md
        │   └── custom-claims.md
        │
        ├── 👤 User Features
        │   ├── account-management.md
        │   ├── profile-management.md
        │   └── usage-dashboard.md
        │
        ├── 👨‍💼 Admin Features
        │   ├── admin-dashboard.md
        │   ├── customer-management.md
        │   ├── subscription-analytics.md
        │   └── order-analytics.md
        │
        ├── 🌍 Public Features
        │   ├── landing-page.md
        │   ├── pricing-page.md
        │   ├── faq-system.md
        │   └── contact-system.md
        │
        └── 📊 Data Models
            ├── user-model.md
            ├── order-model.md
            ├── subscription-model.md
            └── calculator-usage-model.md
```

---

## Quick Navigation Guide

### 🎯 Starting Points

| Role | Start Here | Then Go To |
|------|-----------|------------|
| **New Team Member** | `index.md` | `overview.md` → `domain/` |
| **Developer** | `overview.md` | `core/` + `domain/` |
| **Architect** | `architecture-guide.md` | `core/` |
| **Product Manager** | `overview.md` | `domain/` |

---

## 📚 Document Categories

### ⭐ Core (Reusable)
**Purpose:** Patterns that work for ANY project

**When to use:**
- Starting a new project
- Implementing common features
- Learning best practices
- Making architectural decisions

**Examples:**
- How to implement JWT authentication
- How to design RESTful APIs
- How to structure a React application
- How to implement rate limiting

---

### 🎯 Domain (YourApp-Specific)
**Purpose:** Implementation details for THIS project

**When to use:**
- Working on YourApp features
- Understanding business logic
- Integrating with project services
- Modifying existing functionality

**Examples:**
- How YourApp's calculator system works
- How the three-tier subscription model is implemented
- How Stripe payments are processed
- How Firebase Extension syncs subscriptions

---

## 🔑 Key Concepts

### Separation of Concerns

```
┌─────────────────────────────────────┐
│         CORE ARCHITECTURE           │
│   (Patterns & Best Practices)       │
│                                     │
│  • Authentication patterns          │
│  • API design                       │
│  • Security best practices          │
│  • Component patterns               │
│                                     │
│  ✅ Technology-agnostic             │
│  ✅ Reusable across projects        │
│  ✅ Pattern-focused                 │
└─────────────────────────────────────┘
              ↓ Applied to
┌─────────────────────────────────────┐
│       DOMAIN ARCHITECTURE           │
│     (YourApp Implementation)        │
│                                     │
│  • Financial calculators            │
│  • Subscription tiers               │
│  • Stripe integration               │
│  • Firebase setup                   │
│                                     │
│  ✅ Business-specific               │
│  ✅ Implementation details          │
│  ✅ Feature-focused                 │
└─────────────────────────────────────┘
```

---

## 📖 Reading Order

### For Understanding Patterns
1. `core/README.md` - See all patterns
2. Choose specific pattern → Read core doc
3. See implementation → Check domain doc

### For Understanding YourApp
1. `overview.md` - Get big picture
2. `domain/README.md` - See all features
3. Choose feature → Read domain doc
4. See patterns used → Check core doc

### For Building Features
1. `architecture-guide.md` - Understand organization
2. `core/[pattern].md` - Learn the pattern
3. `domain/[feature].md` - See existing implementation
4. Apply to your feature

---

## 🎓 Examples

### Example 1: Adding Authentication

**Core (Pattern):**
```
core/authentication-system.md
- JWT vs Session-based
- Token refresh strategies
- Security best practices
```

**Domain (Implementation):**
```
domain/firebase-integration.md
- Firebase Auth setup
- Custom claims for tiers
- Integration with Stripe
```

---

### Example 2: Building a New Feature

**Core (Patterns):**
```
core/api-architecture.md
core/authorization-roles.md
core/database-patterns.md
core/component-architecture.md
```

**Domain (Context):**
```
domain/subscription-architecture.md
domain/feature-gating.md
domain/usage-tracking.md
```

---

## 🔄 Document Relationships

```
index.md
    ├── overview.md
    │       ├── Links to core/ patterns
    │       └── Links to domain/ features
    │
    ├── architecture-guide.md
    │       ├── Explains core/
    │       ├── Explains domain/
    │       └── Navigation help
    │
    └── architecture/
            ├── README.md (index)
            ├── core/ → domain/ (pattern → implementation)
            └── domain/ → core/ (feature → patterns used)
```

---

## 🏷️ File Naming Conventions

### Core Documents
- `[concept]-[aspect].md`
- Examples: `authentication-system.md`, `api-architecture.md`
- Focus: What and How (general)

### Domain Documents
- `[feature]-[aspect].md`
- Examples: `calculator-system.md`, `stripe-integration.md`
- Focus: Implementation (specific)

---

## 📝 Maintenance

### Adding New Documentation

1. **Determine category:**
   - Reusable pattern? → `core/`
   - YourApp-specific? → `domain/`

2. **Create document:**
   - Follow naming conventions
   - Use standard structure
   - Include examples

3. **Update indexes:**
   - Add to appropriate README
   - Link from related docs
   - Update this file

---

## 🔍 Finding Documentation

### By Topic
- Check `core/README.md` for patterns
- Check `domain/README.md` for features

### By Category
- Use this file's hierarchy
- Follow folder structure

### By Search
- Use IDE search (Ctrl+Shift+F)
- Search file names
- Search content

---

*This structure ensures clear separation between reusable patterns and project-specific implementations.*

**Last Updated:** December 2025

