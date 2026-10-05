# Architecture Guardrails

**Status:** Binding for the Validation MVP

These rules exist to prevent scope drift, accidental content-farm behavior, unsafe AI recommendations, and premature construction of a larger platform before demand is validated.

## Core product invariant

> **Find software the algorithms missed.**

The implementation must preserve the corresponding discovery philosophy:

- relevance and quality first;
- constraints matter;
- lesser-known products may receive a controlled novelty advantage;
- popularity must not dominate;
- payment must not determine organic ranking.

## AI guardrails

### MUST

- Use AI for bounded intent parsing.
- Use AI for evidence-bounded classification.
- Use AI to explain database-returned recommendations.
- Preserve confidence/evidence for critical factual classifications.
- Treat unknown information as unknown.

### MUST NOT

- Allow the LLM to invent recommendation candidates.
- Publish unsupported AI-generated factual claims.
- Infer `false` from absence of evidence.
- Treat AI confidence alone as factual verification.
- Let AI generate indexable pages without editorial approval.

**AI may parse and explain. AI must not invent recommendation candidates.**

## Evidence guardrails

Critical claims such as pricing, subscription requirements, offline support, privacy, AI behavior, and account requirements must be evidence-backed before being represented as verified.

> **Unknown is not false.**

If evidence is missing, stale, or contradictory, represent the state as unknown/unverified and surface uncertainty honestly.

## SEO/GEO guardrails

### MUST

- Index only approved Product pages and approved Escape Routes.
- Keep natural-language/ad-hoc search results `noindex`.
- Require meaningful candidate density before publishing an Escape Route.
- Maintain canonical URLs.
- Prefer useful comparison information over SEO filler.
- Expose meaningful trade-offs.
- Maintain verification freshness.

### MUST NOT

- Generate the Cartesian product of all anchors × attributes × audiences.
- Create thousands of thin programmatic pages.
- Publish pages solely because a keyword exists.
- auto-index AI-generated search results.
- duplicate the same prose across routes.

Only editorially approved Discovery Graph nodes may become indexable pages.

## Product-scope guardrails

Do **not** build during the Validation MVP:

- creator accounts;
- consumer accounts;
- voting;
- comments;
- user reviews;
- product submission workflow;
- payments;
- paid ranking;
- creator dashboards;
- social network features;
- personalization engine;
- newsletter platform;
- Growth Diagnostic Engine;
- mass ingestion of thousands of products.

These require a new validated need or an explicit future gate.

## Data guardrails

- Supabase/PostgreSQL is the source of truth.
- Do not introduce a second database without demonstrated need.
- Do not introduce a graph database during validation.
- Product/relationship data must remain structurally queryable.
- Product impressions must be measurable.
- Outbound clicks must be measurable.
- Search/constraint context must be retained sufficiently for validation analysis.
- Avoid collecting personally identifying information when anonymous behavior is sufficient.

## Ranking guardrails

Ranking must respect:

> **Quality gates discovery. Novelty may break ties.**

Do not:

- boost low-quality products merely because they are obscure;
- make popularity the primary ranking signal;
- allow payment to improve organic ranking;
- use unrestricted LLM preference as ranking.

## Content guardrails

Every recommendation should be able to answer:

1. Why might this product fit the user's constraint?
2. What is the meaningful trade-off?
3. What evidence supports important factual claims?
4. When was the information last verified?

Avoid affiliate-style "everything is great" copy.

Editorial principle:

> **Recommend less. Explain more.**

## Engineering guardrails

Prefer:

- existing components;
- existing hooks/services;
- a single source of truth;
- simple relational modeling;
- small reversible changes;
- Issue-scoped PRs.

Avoid:

- speculative abstraction;
- large refactors unrelated to the active Issue;
- duplicate state systems;
- parallel data pipelines;
- premature microservices;
- infrastructure added "for later."

## Growth Diagnostic gate

Growth Diagnostic Engine is explicitly **not part of the Validation MVP**.

Do not create Growth Diagnostic product functionality until Discovery Engine has enough real behavior to justify it.

Minimum conceptual gate:

> At least 10 products have sufficient product-level impressions and comparative CTR/intent data to make creator-facing discovery insights meaningful.

Crossing this gate permits **evaluation**, not automatic implementation. A new product decision and GitHub Issue must still be created.

## Expansion gate

Do not expand from 30–40 products to a large database simply because ingestion works.

Expansion must be demand-led.

Examples of valid expansion signals:

- an Escape Route receives meaningful organic impressions;
- users demonstrate strong product/outbound CTR;
- a constraint/anchor combination repeatedly appears in search intent;
- adjacent graph nodes have evidence of demand.

Technical success is not market validation.
