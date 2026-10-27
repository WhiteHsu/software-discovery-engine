# Locale-03A — render-test build isolation

The original runner reused the owner's existing Next production build. Public environment values compiled into that build could still point at the real data source, despite fixture environment overrides at server startup. The stale-translation test changed only the mock product, so a page served from the other source remained available and returned 200. This was a test-isolation defect, not evidence that the translation gate accepted the altered fixture.

The corrected render runners create a separate temporary source-only project, link the existing dependencies, and build it with the localhost fixture URL and a dummy publishable key. No `.env` files, existing `.next` output, or Git metadata are copied. Telemetry and analytics are disabled. A mock-source marker must be present in every tested comparison response. Unknown routes and stale translations still must return 404; the assertions have not been relaxed to accept 200.

Both the ten-route expanded runner and original two-route runner use `scripts/locale-isolated-build.mjs`. The temporary build uses Next's Webpack option to support a dependency junction without changing the owner's application configuration. The existing production build and environment files remain untouched. The junction is removed explicitly before the bounded temporary-directory cleanup.

Validation: corrected expanded runner passed all 17 integration checks; corrected original runner passed all 9 checks. Changed test scripts passed lint. Existing owner results already show 17 unit/contract tests, 94 analytics regression tests, type checking and production build passing, with three pre-existing lint warnings.

After applying this fix, run `node scripts/locale-expanded-render.test.mjs`. Expect an isolated-build message followed by `17 Next integration checks passed`. The temporary build takes longer than the old runner. No dependency install, environment edits, application rebuild, SQL execution or deployment is performed by APPLY. The render runner itself builds only its temporary project.

Then continue Locale-03's database preflight and guarded rollout before pushing. Do not add `type: module` to package.json merely to silence the existing Node module warning.
