# Future Opportunities

**Status:** Parking lot only — not committed roadmap

This document preserves promising extensions without allowing them to leak into the Validation MVP.

Nothing here should be implemented merely because it sounds strategically attractive.

## 1. Growth Diagnostic Engine

### Thesis

Discovery Engine may eventually produce first-party intent data unavailable to a creator's normal analytics stack:

- discovery impressions;
- anchor context;
- constraint context;
- relative product CTR;
- query intent;
- comparison position;
- audience/problem fit;
- Escape Route performance.

This could support creator-facing insights such as:

> "People looking for privacy-first alternatives strongly prefer your product."

or:

> "Your product is shown frequently for simplicity-oriented searches but underperforms comparable products on click-through."

### Potential product ladder

```text
Free Discovery
      |
      v
First-party Intent Dataset
      |
      v
Basic Creator Discovery Analytics
      |
      v
Growth Diagnostic Lite
      |
      v
Connected Growth Engine
   /       |       \
 GSC      GA4     Revenue data
```

### Gate

Do not build Growth Diagnostic functionality until:

> At least 10 products have sufficient product-level impressions and comparative CTR/intent data to make creator-facing insights meaningful.

Crossing the gate only permits a new evaluation phase. It does not automatically add the feature to the roadmap.

## 2. Product claiming

If meaningful discovery data exists, creators could eventually claim an existing product profile.

Possible activation message:

> Your product appeared in 1,284 software discoveries last month. See which user needs drive the most interest.

Not part of Validation MVP.

## 3. Creator submission

Creators may eventually submit products/evidence for review.

This is intentionally deferred because product supply is not the primary validation risk.

A submission system should not be built until maintaining useful product coverage becomes a demonstrated bottleneck.

## 4. Automated verification

Future system could periodically check:

- pricing pages;
- product landing pages;
- app-store metadata;
- documentation;
- offline/privacy claims.

Changes would create review flags rather than silently rewriting verified facts.

Automation should support human verification rather than bypass it.

## 5. Discovery collections

Potential editorial/discovery surfaces:

- Hidden Gems This Week
- Software You Can Actually Own
- Apps That Do One Thing Really Well
- Apps That Don't Want Your Account
- Private Apps That Keep Data on Your Device
- Tiny Alternatives to Big SaaS
- Underrated Mac Apps
- Underrated iPhone Apps

These should be demand-led, not mass generated.

## 6. Additional constraints

Potential graph dimensions after validation:

- no telemetry;
- end-to-end encrypted;
- exportable data;
- interoperable/open format;
- accessibility;
- family-friendly;
- works cross-platform;
- no vendor lock-in.

Only add dimensions that users actually use to make discovery decisions.

## 7. Additional anchors

Possible future anchor ecosystems:

- Evernote
- Canva
- Dropbox
- 1Password
- Slack
- Trello
- Google Drive
- Headspace
- Adobe Illustrator
- other mainstream products producing measurable dissatisfaction intent

Expansion should follow observed demand.

## 8. Recommendation personalization

Potential future behavior:

- remember preferred constraints;
- learn categories a user explores;
- personalize Hidden Gems.

This would increase privacy and identity complexity and is therefore deferred.

## 9. Monetization

Potential future creator monetization:

- discovery analytics;
- competitor benchmarking;
- search opportunity insights;
- positioning diagnostics;
- Growth Diagnostic subscriptions.

Organic ranking should remain independent of payment.

Do not introduce paid ranking as a shortcut to monetization.

## 10. Destination/media layer

If users return for serendipitous discovery, the product could evolve a media layer around:

- weekly Hidden Gems;
- editorial collections;
- creator stories;
- discovery newsletter.

This is conditional on repeat-discovery behavior.

## 11. Internationalization

Global English discovery is the initial thesis.

Localization may eventually create additional demand surfaces, but should not be introduced until the core discovery model is validated.

## Decision rule

A future opportunity becomes roadmap work only when:

1. there is real observed demand or operational need;
2. the opportunity advances the validated product thesis;
3. success criteria can be defined;
4. it receives its own GitHub Issue after explicit prioritization.

The parking lot is not the backlog.
