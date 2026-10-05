# Validation Plan — 30-Day Discovery Demand Experiment

**Version:** 0.1  
**Status:** Frozen before build  
**Experiment starts:** Only after GitHub Issue #11 is complete

## 1. Primary question

> **Can high-intent dissatisfaction with mainstream software be converted into discovery and outbound traffic toward lesser-known products?**

The purpose of the MVP is to falsify or strengthen this hypothesis cheaply.

## 2. Hypotheses

### H1 — Acquisition

High-intent Escape Route pages can earn search impressions for constraint-specific discovery needs.

Examples:

- offline Notion alternatives;
- Notion alternatives without AI;
- Todoist alternatives with a one-time purchase;
- privacy-friendly Grammarly alternatives.

### H2 — Discovery

Visitors arriving on an Escape Route will explore products they may not already know.

Initial target:

> **Escape Route → Product CTR ≥ 15%**

This is a validation target, not an industry benchmark.

### H3 — Action / outbound intent

Product discovery will lead users to visit the product itself.

Initial target:

> **Product View → Outbound CTR ≥ 20%**

This is also a validation target rather than an external benchmark.

### H4 — Serendipity

Curated Hidden Gems/editorial discovery can produce meaningful product exploration independent of explicit replacement queries.

### H5 — Intent intelligence

Different constraints/audiences will produce meaningfully different impression and CTR patterns for products.

If this emerges, Discovery Engine may be generating a unique creator-intelligence dataset.

## 3. Launch content

Validation begins with approximately:

- 30–40 verified products;
- 5 anchor ecosystems;
- ≥10 attributes;
- 10 Escape Routes;
- 1 Hidden Gems surface.

The launch Escape Routes are:

1. Offline Notion Alternatives
2. Notion Alternatives Without AI
3. Simple Notion Alternatives
4. Todoist Alternatives With a One-Time Purchase
5. Privacy-Friendly Grammarly Alternatives
6. Grammarly Alternatives Without a Subscription
7. Photoshop Alternatives Without a Subscription
8. PDF Editors Without a Subscription
9. Meditation Apps Without a Subscription
10. Productivity Apps You Can Buy Once

## 4. Required instrumentation

The experiment cannot start until these are verified in production:

- page views;
- Escape Route views;
- product impressions;
- product clicks;
- outbound clicks;
- natural-language searches;
- parsed search intent;
- anchor selections;
- constraint selections;
- rank/position;
- source/referrer where available.

Impressions are mandatory because clicks without exposure cannot produce meaningful CTR.

## 5. Primary metrics

### Acquisition

- indexed pages;
- Google Search impressions;
- organic clicks;
- discovered long-tail queries;
- answer-engine/LLM referrals where identifiable.

### Discovery

- Escape Route → Product CTR;
- Search Results → Product CTR;
- Hidden Gems → Product CTR.

### Action

- Product View → Outbound CTR;
- Escape Route → Outbound product visits.

### Return behavior

- returning anonymous visitors;
- repeat discovery behavior where measurable without accounts.

### Graph learning

Performance by:

- anchor;
- constraint;
- Escape Route;
- product;
- query intent;
- rank/position.

## 6. Interpretation framework

### Strong signal

Examples of strong evidence include:

- at least three Escape Routes begin receiving meaningful impressions;
- multiple relevant long-tail queries appear;
- Escape Route → Product CTR reaches or exceeds the initial 15% target in meaningful samples;
- Product View → Outbound CTR reaches or exceeds the initial 20% target in meaningful samples;
- users click lesser-known products rather than only familiar names.

**Action:** Proceed with demand-led expansion.

### Weak but interesting signal

Examples:

- search impressions appear but CTR is weak;
- users reach Escape Routes but rarely explore products;
- some constraints perform while others do not;
- Hidden Gems works but search acquisition does not, or vice versa.

**Action:** Diagnose positioning, SERP snippets, UX, recommendation quality, or route selection before expanding.

### Negative signal

Examples:

- after a reasonable indexing period, approved routes receive almost no relevant impressions;
- visitors rarely click products;
- product pages produce almost no outbound action;
- curated discovery produces no meaningful interaction;
- observed traffic is primarily creators submitting/promoting rather than consumers discovering.

**Action:** Do not expand the database. Reassess or stop the hypothesis.

## 7. What does not count as validation

Do not treat these as product-market evidence:

- successful deployment;
- passing CI;
- 30 products successfully imported;
- pages indexed without relevant impressions;
- creator enthusiasm about being listed;
- founders asking to submit products;
- social likes without product discovery;
- raw page views without downstream behavior.

The hard problem is consumer demand and discovery behavior, not product supply.

## 8. 30-day operating rule

During the observation window:

1. Fix bugs and measurement defects.
2. Correct factual inaccuracies.
3. Improve obviously broken UX.
4. Do not flood the site with hundreds of products/pages.
5. Expand only when a specific demand signal justifies an adjacent graph node.
6. Preserve a record of material changes so metric interpretation remains possible.

## 9. Validation timeline

### Day 0

Issue #11 complete. Record:

- production URL;
- product count;
- Escape Route count;
- indexed sitemap state;
- analytics health;
- baseline status.

### Days 1–7

Focus on:

- indexing health;
- crawlability;
- instrumentation correctness;
- initial distribution;
- bug correction.

Avoid drawing strong SEO conclusions too early.

### Days 8–21

Observe:

- emerging search queries;
- Escape Route differences;
- discovery CTR;
- outbound behavior;
- potential adjacent intent.

### Days 22–30

Consolidate:

- strongest/weakest routes;
- strongest constraints;
- products with differentiated intent fit;
- destination vs search behavior;
- evidence for/against expansion.

### Day 30 decision

Choose one:

- **Proceed** — demand is strong enough to expand.
- **Iterate** — signal exists but product/acquisition needs correction.
- **Stop/Pivot** — discovery hypothesis lacks sufficient evidence.

## 10. Growth Diagnostic evaluation gate

Growth Diagnostic Engine is not part of this experiment.

Only evaluate a creator-facing diagnostic product when:

> ≥10 products have enough product-level impression and comparative CTR/intent data to generate non-trivial creator insights.

Example future insight:

> "Users seeking privacy-first alternatives click your product much more often than users seeking minimalist tools."

This gate prevents building creator analytics before the platform owns useful discovery data.
