# Product Spec — Validation MVP

**Version:** 0.1  
**Status:** Frozen for Validation MVP  
**Working name:** Software Discovery Engine  
**Core thesis:** **Find software the algorithms missed.**

## 1. Product definition

Software Discovery Engine is a **constraint-aware software discovery engine** for finding better alternatives to mainstream software.

It is not:

- an Indie App directory;
- a Product Hunt clone;
- an App Store;
- a generic review site;
- a chatbot whose language model invents recommendations.

The core consumer problem is not "I want indie software." It is:

> "The mainstream product I know no longer fits what I care about. What else should I use?"

The initial discovery model is:

**Big Software → Dissatisfaction → Constraint → Escape Route → Lesser-known Software**

Examples of dissatisfaction/constraints include:

- no subscription / buy once;
- no forced AI;
- offline;
- privacy-first;
- local-first;
- no account;
- simpler/minimalist;
- open source/self-hostable where relevant.

## 2. Validation question

The Validation MVP exists to answer one primary question:

> **Can high-intent dissatisfaction with mainstream software be converted into meaningful discovery and outbound traffic toward lesser-known products?**

The MVP is an experiment, not a commitment to build a comprehensive software database.

## 3. Target consumer behavior

### Intent discovery

A user knows what they want to replace or what constraint matters.

Example:

> "I want something like Notion but simpler, offline, and without AI."

Expected flow:

**Search / LLM / Direct → Escape Route or Discovery Search → Product → Outbound visit**

### Serendipitous discovery

A user wants interesting software they have not already seen.

Expected flow:

**Editorial / social / direct → Hidden Gems → Product → Outbound visit**

Intent discovery is the primary validation wedge. Serendipitous discovery is secondary.

## 4. Initial anchors

The Validation MVP concentrates graph density around five ecosystems:

1. Notion
2. Todoist
3. Grammarly
4. Adobe / PDF workflows
5. Calm / meditation

These are discovery anchors, not endorsements.

## 5. Initial constraints

The initial taxonomy should support at least:

- `no_subscription`
- `one_time_purchase`
- `free`
- `offline`
- `local_first`
- `privacy_first`
- `no_ai`
- `no_account`
- `open_source`
- `self_hostable`
- `minimalist`

Attributes must support evidence, confidence, and verification state.

## 6. Initial Escape Routes

The launch set is:

1. **Offline Notion Alternatives**
2. **Notion Alternatives Without AI**
3. **Simple Notion Alternatives**
4. **Todoist Alternatives With a One-Time Purchase**
5. **Privacy-Friendly Grammarly Alternatives**
6. **Grammarly Alternatives Without a Subscription**
7. **Photoshop Alternatives Without a Subscription**
8. **PDF Editors Without a Subscription**
9. **Meditation Apps Without a Subscription**
10. **Productivity Apps You Can Buy Once**

Do not automatically generate the Cartesian product of anchors × constraints. A Discovery Graph node becomes a public/indexable Escape Route only when it has enough evidence, candidates, and meaningful user intent.

## 7. Homepage

Primary message:

# Find software the algorithms missed.

Supporting proposition:

> Discover simpler, private, subscription-free alternatives beyond the big names.

Primary interaction:

**What are you looking for?**

Example placeholder:

> Something like Notion, but offline and without AI…

The homepage should expose:

- natural-language discovery;
- Popular Escape Routes;
- anchor-based navigation;
- constraint-based navigation;
- a small Hidden Gems collection.

It must not look like a generic "10,000 apps" directory.

## 8. Escape Route page

Canonical route:

`/escape/[slug]`

An Escape Route should prioritize decision utility over SEO filler.

Required content:

- clear query-aligned H1;
- concise explanation of the escape reason;
- comparison view;
- relevant candidates;
- verified constraint fit;
- recommendation reasoning;
- meaningful trade-offs;
- pricing where verified;
- last verification information;
- links to canonical product pages.

Every published launch Escape Route must have at least three legitimate candidates.

## 9. Product page

Canonical route:

`/software/[slug]`

Required content:

- product positioning;
- "Why it's worth discovering";
- best-for use cases/audiences;
- verified attributes;
- platforms;
- pricing where verified;
- "Consider it if…";
- "Skip it if…" / meaningful trade-offs;
- mainstream anchors it may replace;
- relevant Escape Routes;
- last verified date;
- outbound CTA.

Unknown data must remain visibly unknown rather than inferred.

## 10. Natural-language discovery

The language model performs **intent parsing**, not open-ended recommendation.

Example input:

> I want something like Notion but simpler and no AI.

Expected structured intent:

```json
{
  "anchor": "notion",
  "problem": "knowledge_management",
  "attributes": ["minimalist", "no_ai"]
}
```

Pipeline:

**User Query → Intent Parser → Structured Intent → Graph Query → Candidate Ranking → Explanation**

Candidate products must come from the application database.

## 11. Ranking philosophy

Initial conceptual ranking:

- Relevance: 40%
- Constraint fit: 25%
- Quality: 20%
- Novelty: 15%

Exact implementation may evolve during Issue #5, but these invariants are frozen:

1. **Quality gates discovery.**
2. Novelty can help a lesser-known product after it passes quality/relevance thresholds.
3. Popularity must not be the primary ranking signal.
4. Payment must not influence organic ranking during the Validation MVP.

The slogan **"Find software the algorithms missed"** must be reflected in ranking behavior, not only marketing copy.

## 12. Evidence model

AI may propose classification, but publication requires evidence-backed data.

For important claims, the system should be capable of representing:

- value;
- confidence;
- evidence source;
- verification status;
- `verified_at`.

Critical principle:

> **Absence of evidence = unknown.**

It must never silently become `false`.

This is especially important for:

- subscription requirements;
- AI features;
- offline support;
- privacy claims;
- account requirements;
- pricing.

## 13. Discovery analytics

The MVP must record enough information to calculate discovery CTR and later evaluate whether intent data could support creator intelligence.

Required event families:

- page view;
- search;
- search-result view;
- Escape Route view;
- product impression;
- product click;
- outbound click;
- constraint selection;
- anchor selection.

**Product impressions are mandatory.** Clicks without impressions cannot produce meaningful CTR.

## 14. SEO/GEO behavior

Indexable:

- approved Product pages;
- editorially approved Escape Routes.

Not indexable:

- arbitrary natural-language search-result pages;
- thin/unapproved graph combinations;
- automatically generated low-evidence pages.

Pages should expose factual, machine-readable information where appropriate, including verification freshness and meaningful trade-offs.

## 15. MVP scope

### In scope

- homepage;
- 30–40 verified products;
- 5 anchor ecosystems;
- ≥10 core attributes;
- 10 Escape Routes;
- product pages;
- natural-language discovery;
- graph-backed ranking;
- event tracking;
- SEO/GEO foundation;
- Hidden Gems surface;
- 30-day validation.

### Explicitly out of scope

- creator accounts;
- consumer accounts;
- product submissions;
- voting;
- comments;
- user reviews;
- payments;
- paid ranking;
- creator dashboard;
- personalization;
- newsletter platform;
- Growth Diagnostic Engine;
- mass programmatic SEO;
- thousands of products.

## 16. Definition of Done for Validation MVP

The MVP is ready to enter production validation only when:

### Content
- ≥30 verified products;
- 5 anchors represented;
- ≥10 attributes supported;
- all 10 launch Escape Routes pass quality review;
- Hidden Gems collection exists.

### Product
- homepage works;
- Escape Route pages work;
- Product pages work;
- natural-language discovery works;
- outbound links work.

### Data
- impressions tracked;
- product clicks tracked;
- outbound clicks tracked;
- search intent tracked;
- source/referrer captured where available.

### SEO/GEO
- approved Escape Routes indexable;
- Product pages indexable;
- search results noindex;
- sitemap(s) work;
- canonical behavior works;
- structured data is valid where used.

### Quality
- no unsupported pricing claims;
- no unsupported critical attributes;
- every recommendation exposes a meaningful trade-off;
- every public Escape Route has ≥3 legitimate candidates.

Shipping the MVP begins the experiment. It does not prove the product.
