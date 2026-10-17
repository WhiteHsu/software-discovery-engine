import type {PrivacyProfile} from './privacy-proposal.ts';
// Reviewed immutable local profiles from PR5.98/99; no live policy fetch or telemetry.
type RuntimePrivacyProfile=Omit<PrivacyProfile,'axes'> & {family:string;axes:Record<string,PrivacyProfile['axes'][string] & {decision?:string}>};
export const reviewedPrivacyProfiles:RuntimePrivacyProfile[] = [
  {
    "slug": "languagetool-local-cli-6-6",
    "profileId": "lt-6-6-direct-cli-explicit-local-conditions",
    "statement": "LanguageTool — reviewed local profile. Conditional selected-use statement for fixed LanguageTool6.6 direct CLI: local rules process English stdin with no server/client or selected remote-rule resources. Require fixed distribution, explicit settings and no injected JVM options. Text-bearing JSON, diagnostic/error snippets and caller copies remain local-operation outputs to manage; no no-retention, network-block or whole-host guarantee.",
    "axes": {
      "processing": {
        "summary": "Fixed6.6 CLI and JRE file snapshots, English local rule selection with PICKY and explicit passive IDs, stdin input. Empty selected remote resources follow reviewed factory branches. No HTTP server/client/editor selected.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/languagetool-cli-source-2026-10-17.json",
          "seed/research/languagetool-cli-defaults-2026-10-17.json",
          "seed/research/languagetool-distribution-profile-2026-10-17.json",
          "seed/research/languagetool-synthetic-profile-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-only-this-conditional-local-operation-wording; excluded host/global behavior is not covered"
      },
      "retention": {
        "summary": "JSON holds context/sentence; stderr/error branches may include text. Caller captures/copies and runtime memory are explicit sinks, not promised deleted. Own temporary directory removal observed for synthetic harness only, not secure erasure or every CLI copy.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/languagetool-cli-source-2026-10-17.json",
          "seed/research/languagetool-cli-defaults-2026-10-17.json",
          "seed/research/languagetool-distribution-profile-2026-10-17.json",
          "seed/research/languagetool-synthetic-profile-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-only-this-conditional-local-operation-wording; excluded host/global behavior is not covered"
      },
      "training": {
        "summary": "Selected local rule branches do not implement a training submission operation. No vendor-wide no-training policy inferred, and hosted Basic/Premium excluded.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/languagetool-cli-source-2026-10-17.json",
          "seed/research/languagetool-cli-defaults-2026-10-17.json",
          "seed/research/languagetool-distribution-profile-2026-10-17.json",
          "seed/research/languagetool-synthetic-profile-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-only-this-conditional-local-operation-wording; excluded host/global behavior is not covered"
      },
      "integrations": {
        "summary": "Direct command-line entry only. No server/client/add-on, language-model resource, custom rules or external diagnostic feature included. Controlled home/tmp paths and rejected injected JVM options are conditions, not OS containment.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/languagetool-cli-source-2026-10-17.json",
          "seed/research/languagetool-cli-defaults-2026-10-17.json",
          "seed/research/languagetool-distribution-profile-2026-10-17.json",
          "seed/research/languagetool-synthetic-profile-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-only-this-conditional-local-operation-wording; excluded host/global behavior is not covered"
      },
      "telemetry": {
        "summary": "Reviewed bundled logger is console-based; empty remote factories and OTel API/global-noop/default bootstrap observations constrain the selected profile. Not an assertion of all dependency/platform side effects, externally preconfigured providers or universal zero traffic.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/languagetool-cli-source-2026-10-17.json",
          "seed/research/languagetool-cli-defaults-2026-10-17.json",
          "seed/research/languagetool-distribution-profile-2026-10-17.json",
          "seed/research/languagetool-synthetic-profile-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-only-this-conditional-local-operation-wording; excluded host/global behavior is not covered"
      },
      "rights": {
        "summary": "Official local6.6 distribution COPYING identifies LGPL plus separately licensed resources/libraries; portable JRE and component notices separate. No hosted service subscription used; no complete legal audit.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/languagetool-cli-source-2026-10-17.json",
          "seed/research/languagetool-cli-defaults-2026-10-17.json",
          "seed/research/languagetool-distribution-profile-2026-10-17.json",
          "seed/research/languagetool-synthetic-profile-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-only-this-conditional-local-operation-wording; excluded host/global behavior is not covered"
      }
    },
    "family": "LanguageTool"
  },
  {
    "slug": "write-good-local-library-1-0-8",
    "profileId": "write-good-local-library-1-0-8",
    "statement": "write-good — reviewed local profile. For the fixed direct local function profile only: inspected loaded source performs in-memory matching and returns text-bearing suggestions, without direct network or persistence calls. Caller storage, integrations, runtime/OS diagnostics and memory deletion are outside this claim. Requires technical integration; not a vendor-wide privacy guarantee.",
    "axes": {
      "processing": {
        "summary": "The exact npm1.0.8 direct-function profile executes string matching in local Node memory. Source acquisition used network before input; no input sent through package installation.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/write-good-library-review-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "supported-for-exact-function-path-with-stated-limits"
      },
      "retention": {
        "summary": "Input, returned matched prose and module regex state are in managed memory. Inspected14 loaded files do not implement direct persistence. Caller logs, saved outputs, OS diagnostics, heap snapshots and secure deletion are excluded, explicit residual risks. Local memory lifetime is not claimed zero.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/write-good-library-review-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "supported-for-exact-function-path-with-stated-limits"
      },
      "training": {
        "summary": "No training/submission function in selected loaded source path; no vendor-wide policy inference or claim about arbitrary caller.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/write-good-library-review-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "supported-for-exact-function-path-with-stated-limits"
      },
      "integrations": {
        "summary": "Stock checks only; non-passive modules still loaded and inspected. No custom checks, annotate invocation, editor/CLI/server integration, or external callback supplied.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/write-good-library-review-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "supported-for-exact-function-path-with-stated-limits"
      },
      "telemetry": {
        "summary": "Selected loaded source contains no account, telemetry, network, console or process-spawn call. This does not attest Node runtime/OS or importing application behavior. The claim is about the reviewed function path, not the entire host process.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/write-good-library-review-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "supported-for-exact-function-path-with-stated-limits"
      },
      "rights": {
        "summary": "Eight locked package metadata declarations MIT, core LICENSE inspected. No paid account or hosted service required by tested local operation; notices and integration costs remain separate.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/write-good-library-review-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "supported-for-exact-function-path-with-stated-limits"
      }
    },
    "family": "write-good"
  },
  {
    "slug": "vale-local-passive-3-24-0",
    "profileId": "vale-3-24-0-fixed-plain-stdin-local-passive",
    "statement": "Vale — reviewed local profile. For fixed Vale3.24.0 plain-stdin invocation with only the fixed local Microsoft.Passive rule, explicit local config/no-global, no pipeline sources, empty NLP endpoint and excluded profiling variables: selected rule checks locally and returns text-bearing JSON. Caller logs/files, host diagnostics, extensions and optional remote NLP are outside this statement; no zero-retention or whole-product guarantee.",
    "axes": {
      "processing": {
        "summary": "Fixed3.24.0 portable CLI and Microsoft.Passive rule; plain-text stdin, explicit local ini/no-global. Effective single config, empty NLP endpoint and count map only Microsoft.Passive previously observed.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/vale-local-rule-review-2026-10-17.json",
          "seed/research/vale-data-path-review-2026-10-17.json",
          "seed/research/scoped-writing-drafts-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-conditional-selected-local-rule-profile-only"
      },
      "retention": {
        "summary": "stdin read into memory; JSON includes matched words and message; stderr may contain errors. Caller capture/storage and runtime/OS copies remain, not promised erased. No zero-retention or secure-delete claim.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/vale-local-rule-review-2026-10-17.json",
          "seed/research/vale-data-path-review-2026-10-17.json",
          "seed/research/scoped-writing-drafts-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-conditional-selected-local-rule-profile-only"
      },
      "training": {
        "summary": "No training/submission operation found in selected existence runner and configured empty-endpoint flow. No policy claim for CMS, vendor or arbitrary extensions.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/vale-local-rule-review-2026-10-17.json",
          "seed/research/vale-data-path-review-2026-10-17.json",
          "seed/research/scoped-writing-drafts-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-conditional-selected-local-rule-profile-only"
      },
      "integrations": {
        "summary": "No Packages/sync/CMS, custom script, formatter pipeline, external rule inheritance or editor integration in selected profile. styles/.vale-config absent, one fixed YAML; changes would require re-evaluation.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/vale-local-rule-review-2026-10-17.json",
          "seed/research/vale-data-path-review-2026-10-17.json",
          "seed/research/scoped-writing-drafts-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-conditional-selected-local-rule-profile-only"
      },
      "telemetry": {
        "summary": "Profiling runs before flags but selected child environment excludes VALE_* controls; explicit no-global prevents default global style/config path addition. NewLinter initializes a default HTTP client without sending a request there; selected local existence rule does not invoke remote NLP. Not a full dependency/platform audit or network block.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/vale-local-rule-review-2026-10-17.json",
          "seed/research/vale-data-path-review-2026-10-17.json",
          "seed/research/scoped-writing-drafts-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-conditional-selected-local-rule-profile-only"
      },
      "rights": {
        "summary": "Fixed CLI MIT license and fixed Microsoft collection MIT license reviewed separately; hosted CMS excluded. No paid account used, no legal audit or price guarantee.",
        "reviewedAt": "2026-10-17",
        "evidence": [
          "seed/research/vale-local-rule-review-2026-10-17.json",
          "seed/research/vale-data-path-review-2026-10-17.json",
          "seed/research/scoped-writing-drafts-2026-10-17.json"
        ],
        "materialUnknown": false,
        "decision": "support-conditional-selected-local-rule-profile-only"
      }
    },
    "family": "Vale"
  }
];
