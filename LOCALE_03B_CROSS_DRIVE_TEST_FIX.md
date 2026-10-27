# Locale-03B — Windows cross-drive fixture-build compatibility

The owner's D: source/dependency tree with the Locale-03A C: temporary build reproduced the same webpack compilation failure shown in the screenshot. The dependency junction and use of the original Next binary were removed. The temporary site now receives an actual copy of the existing installed dependencies and runs its own copied Next binary. No dependency download, owner environment change, application change, SQL execution or deployment is involved.

Build input remains a source-only copy: no `.env*` root files, `.git`, previous `.next` or existing production build are copied. The fixture URL and dummy key are supplied before compilation. Telemetry and analytics are disabled. Both render runners also write their captured HTML only inside the temporary test project, rather than creating additional files in the owner's repo. Temporary cleanup verifies the absolute target and removes only its named test directory.

Validation used the actual D: source and installed dependencies, read-only, with output in a C: temporary project. The cross-drive production build passed, and the complete expanded runner passed all 17 integration checks with the required synthetic source marker. The stale-translation assertion remains a strict 404 check. Changed scripts passed lint.

Apply this packet after Locale-03A, then rerun `node scripts/locale-expanded-render.test.mjs`. It first copies installed packages and builds the temporary project, so it takes longer. Keep the terminal open until it reports `17 Next integration checks passed` and returns to the prompt.

The existing MODULE_TYPELESS_PACKAGE_JSON warning is separate; do not change package.json to suppress it. After success, continue the original Locale-03 database preflight before pushing. Include this note and the updated test helper/runners in the eventual #20 commit.
