# Documentation Structure

## Complete Folder Hierarchy

```
docs/AI_Orchestrator/
│
├── 📄 index.md                          # Documentation hub (START HERE)
├── 📄 overview.md                       # Complete project overview
├── 📄 architecture-guide.md             # How to navigate documentation
├── 📄 STRUCTURE.md                      # This file
│
├── 📁 roles/                            # 🤖 AI Role Definitions
│   ├── code-organization-expert.md      # Code organization specialist
│   ├── core-feature-swap-expert.md      # Core feature swap guide
│   ├── security-engineer.md             # Security expert
│   └── UI-design-expert.md              # UI/UX design expert
│
├── 📁 consider/                         # 💭 Architecture Considerations
│   ├── e2e-testing-plan.md              # E2E testing strategy
│   ├── graphql-architecture.md          # GraphQL integration options
│   ├── owasp-top10-review.md            # OWASP security review
│   ├── production-readiness.md          # Pre-launch checklist
│   ├── react-query-migration-guide.md   # SWR → TanStack Query migration
│   ├── testing-100-coverage-plan.md     # Full coverage testing plan
│   └── testing-implementation-plan.md   # Comprehensive test plan
│
├── 📁 graveyard/                        # 🪦 Archived / completed docs
│   └── security-audit-tickets.md        # Completed security audit (all resolved)
│
├── 📁 issues/                           # 🐛 Known issues
│   └── index.md                         # Issues tracker (resolved + open)
│
├── 📁 plantofix/                        # 🔧 Planned fixes & refactors
│   └── index.md                         # Fix backlog
│
├── 📁 troubleshooting/                  # 🛠️ Step-by-step fixes
│   ├── README.md
│   ├── stripe-role-missing.md
│   ├── subscription-cancellation-during-trial.md
│   ├── subscription-upgrade-downgrade-flow.md
│   └── translation-system.md
│
└── 📁 architecture/
    │
    ├── 📄 README.md                     # Architecture index
    ├── 📄 architecture-diagrams.md      # System & data flow Mermaid diagrams
    │
    ├── 📁 core/                         # ⭐ REUSABLE PATTERNS
    │   │                                # Can be used in ANY project
    │   ├── 📄 README.md
    │   ├── 📄 api.md                    # API design & client-side fetch
    │   ├── 📄 api-auth-context-pattern.md # Auth context passthrough pattern
    │   ├── 📄 authentication.md         # Authentication system
    │   ├── 📄 code-structure.md         # Code organization patterns
    │   ├── 📄 database.md               # Database patterns
    │   ├── 📄 error-handling.md         # Error handling strategies
    │   ├── 📄 logging-monitoring.md     # Logging & monitoring
    │   ├── 📄 performance.md            # Performance optimization
    │   └── 📄 security.md               # Security best practices
    │
    └── 📁 domain/                       # 🎯 TEMPLATE DEFAULT
        │                                # Project business logic
        ├── 📄 README.md
        ├── 📄 account-management.md     # User account features
        ├── 📄 admin-dashboard.md        # Admin panel
        ├── 📄 business-model.md         # Business model & subscriptions
        ├── 📄 calculator-system.md      # Default core feature (calculator)
        └── 📄 subscription-system.md    # Subscription management
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

