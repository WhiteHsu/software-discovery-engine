# Architecture — Validation MVP

**Version:** 0.1  
**Status:** Initial architecture contract

## 1. Architecture goals

The architecture should optimize for:

1. fast solo-founder iteration;
2. evidence-backed discovery;
3. measurable user behavior;
4. safe use of AI;
5. SEO/GEO-friendly public pages;
6. minimal operational complexity during validation.

Do not optimize prematurely for massive scale.

## 2. Planned stack

Initial stack:

- **Next.js**
- **TypeScript**
- **Supabase / PostgreSQL**
- **OpenAI** for structured intent parsing and bounded explanation/classification workflows
- **Vercel** for deployment
- GitHub for Issues, source control, CI, and PR workflow

Issue #1 will finalize concrete package versions and project configuration.

## 3. High-level system

```text
Browser
  |
  v
Next.js Application
  |
  +--> Public Product / Escape Route UI
  |
  +--> Discovery Service
  |       |
  |       +--> Structured Graph Queries
  |       |
  |       +--> Ranking
  |       |
  |       +--> Explanation Context
  |
  +--> AI Service
  |       |
  |       +--> Intent Parsing
  |       +--> Evidence-bounded Classification
  |       +--> Explanation
  |
  +--> Analytics Service
          |
          +--> Event Store

                    |
                    v
             Supabase/PostgreSQL
```

## 4. Discovery Graph storage

The Validation MVP uses relational PostgreSQL tables as a graph-like model.

Expected core entities:

- `products`
- `anchors`
- `attributes`
- `problems`
- `audiences`
- `product_attributes`
- `product_anchors`
- `product_problems`
- `product_audiences`
- `escape_routes`
- `escape_route_products`
- `events`

Do not introduce Neo4j or another graph database during validation.

## 5. Product facts and relationships

Important product facts/edges should support evidence and confidence.

Conceptually:

```text
Product
  |
  +-- solves ------> Problem
  +-- replaces ----> Anchor
  +-- fits --------> Audience
  +-- has ---------> Attribute
  +-- appears in --> Escape Route
```

For claims such as offline support or pricing model, storage should be capable of retaining:

- claim/value;
- confidence;
- evidence/source;
- verification status;
- verification timestamp.

The exact normalized schema is owned by Issue #2.

## 6. AI boundaries

AI has three permitted roles in the Validation MVP:

### Intent parsing

Convert natural language into the known graph taxonomy.

```text
"I want something like Notion but offline and no AI"
        |
        v
anchor=notion
attributes=[offline,no_ai]
```

### Evidence-bounded classification

Given supplied product evidence, propose structured classifications and confidence.

### Explanation

Explain why database-returned candidates match the structured intent.

AI does **not** own the candidate set.

Canonical discovery pipeline:

```text
User Query
   |
   v
AI Intent Parser
   |
   v
Structured Intent
   |
   v
Database / Graph Query
   |
   v
Candidate Products
   |
   v
Deterministic / bounded Ranking
   |
   v
Explanation
```

## 7. Ranking

Ranking must operate on verified graph data rather than unrestricted LLM preference.

Initial conceptual components:

- relevance;
- constraint fit;
- quality;
- novelty.

Quality/relevance thresholds should be applied before novelty.

Do not use popularity as the dominant signal.

## 8. Routing

Expected public routes:

```text
/
 /software/[slug]
 /escape/[slug]
 /replace/[slug]
 /hidden-gems
 /discover
```

Natural-language/ad-hoc result pages must not automatically become indexable SEO pages.

## 9. Analytics architecture

Discovery analytics must be first-party and anonymous for the MVP.

Core identifiers:

- anonymous user/session identifier;
- page/context;
- product;
- anchor;
- Escape Route;
- constraint;
- rank/position;
- raw query where appropriate;
- parsed intent;
- source/referrer;
- timestamp.

Critical event:

`product_impression`

Without impression tracking, the platform cannot calculate Discovery CTR.

## 10. SEO/GEO architecture

Approved public content should be server-renderable/indexable as appropriate.

The application should support:

- canonical metadata;
- sitemaps;
- robots controls;
- structured data where justified;
- internal linking derived from graph relationships;
- last-updated/last-verified freshness signals.

Only editorially approved graph nodes become indexable.

## 11. Seed/evidence workflow

Initial data volume is small enough for human review.

Expected flow:

```text
Product URL / evidence
        |
        v
Evidence extraction
        |
        v
AI classification proposal
        |
        v
Evidence mapping
        |
        v
Human review
        |
        v
Published structured data
```

The first 30–40 products should favor correctness over automation.

## 12. Repository workflow

GitHub Issue = product/engineering capability.

PR = implementation increment within an Issue.

Example:

```text
Issue #3 — Seed Data & Evidence Pipeline
  |
  +-- PR3.1 Seed format
  +-- PR3.2 Evidence model
  +-- PR3.3 Initial product dataset
```

`STATUS.md` is updated as Issues advance so future sessions can resume from repository state.

## 13. Evolution policy

Architecture may evolve only when the current validation need requires it.

Before adding a major system, ask:

1. Does it directly help test the validation hypothesis?
2. Is the current architecture demonstrably insufficient?
3. Can the change be reversed cheaply?
4. Does it violate `ARCHITECTURE_GUARDRAILS.md`?

If the answer does not justify the complexity, defer it.
