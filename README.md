# Software Discovery Engine

> **Find software the algorithms missed.**

Software Discovery Engine is a validation-stage product for discovering better software beyond the biggest names. It organizes **Escape Routes** from mainstream software around the reasons people actually want to leave: subscriptions, forced AI, cloud dependence, privacy concerns, complexity, and other constraints.

This repository intentionally starts as a small, evidence-backed validation MVP rather than a large software directory.

## Product thesis

Mainstream discovery systems tend to reward products that are already popular. This project tests a different discovery model:

**Big Software → Dissatisfaction → Constraint → Escape Route → Lesser-known Software**

The initial product should help a user express needs such as:

- "Something like Notion, but offline and without AI."
- "A Todoist alternative I can buy once."
- "A privacy-friendly alternative to Grammarly."
- "A PDF editor without another subscription."

The system then retrieves candidates from a verified Discovery Graph and explains why they match.

## Core principle

**AI may parse and explain. AI must not invent recommendation candidates.**

Products, attributes, relationships, pricing claims, and Escape Route membership must come from the evidence-backed application dataset.

## Validation MVP

The initial validation scope is deliberately constrained to:

- 5 anchor ecosystems
- 30–40 human-reviewed seed products
- 10 launch Escape Routes
- Product discovery pages
- Natural-language intent parsing
- Discovery analytics
- SEO/GEO infrastructure
- One Hidden Gems discovery surface
- A 30-day production validation window

The MVP explicitly excludes accounts, voting, reviews, product submissions, payments, creator dashboards, and Growth Diagnostic Engine functionality.

## Roadmap

GitHub Issues are the unit of product/engineering capability. Pull requests are implementation increments within an Issue.

1. Foundation & Core Infrastructure
2. Discovery Graph Data Model
3. Seed Data & Evidence Pipeline
4. Product Discovery Pages
5. Escape Route Engine
6. Homepage & Discovery Navigation
7. Natural-Language Discovery
8. Discovery Analytics
9. SEO & GEO Infrastructure
10. Evidence & Quality Audit
11. Production Validation Launch

See:

- [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`ARCHITECTURE_GUARDRAILS.md`](./ARCHITECTURE_GUARDRAILS.md)
- [`VALIDATION_PLAN.md`](./VALIDATION_PLAN.md)
- [`FUTURE_OPPORTUNITIES.md`](./FUTURE_OPPORTUNITIES.md)
- [`STATUS.md`](./STATUS.md)

## Current status

**PR0 — Build Preparation**

No application functionality should be implemented until PR0 is committed. The next implementation milestone is GitHub Issue #1, **Foundation & Core Infrastructure**.
