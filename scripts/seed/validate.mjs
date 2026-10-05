import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const sourceTypes = new Set([
  "official",
  "documentation",
  "pricing",
  "app_store",
  "repository",
  "third_party",
  "manual",
]);

const verificationStates = new Set([
  "verified",
  "likely",
  "unknown",
]);

const productStatuses = new Set([
  "draft",
  "review",
  "published",
  "archived",
]);

const relationshipTypes = new Set([
  "alternative",
  "replacement",
  "complement",
]);

const valueTypes = new Set([
  "boolean",
  "text",
  "number",
  "enum",
]);

function fail(errors) {
  console.error(
    `Seed validation failed with ${errors.length} error(s):`,
  );

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exitCode = 1;
}

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(
      `Cannot read JSON ${file}: ${error.message}`,
    );
  }
}

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function validDate(value) {
  return (
    typeof value === "string" &&
    !Number.isNaN(Date.parse(value))
  );
}

function validHttpUrl(value) {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function nonEmpty(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function uniqueIndex(
  items,
  key,
  label,
  errors,
) {
  const map = new Map();

  items.forEach((item, index) => {
    const value = item?.[key];

    if (!nonEmpty(value)) {
      errors.push(
        `${label}[${index}].${key} must be a non-empty string`,
      );
    } else if (map.has(value)) {
      errors.push(
        `${label} contains duplicate ${key} '${value}'`,
      );
    } else {
      map.set(value, item);
    }
  });

  return map;
}

function requireSlug(
  value,
  where,
  errors,
) {
  if (
    !nonEmpty(value) ||
    !slugPattern.test(value)
  ) {
    errors.push(
      `${where} must be a kebab-case slug`,
    );
  }
}

/*
 * Evidence boundary
 * -----------------
 *
 * verified / likely:
 *   These are asserted claims.
 *   They MUST contain supporting evidence.
 *
 * unknown:
 *   This explicitly means we do not have
 *   enough evidence to assert the claim.
 *
 * Therefore this is VALID:
 *
 *   value: null
 *   verificationStatus: "unknown"
 *   confidence: null
 *   lastVerifiedAt: null
 *   evidence: []
 *
 * Core invariant:
 *
 *   Absence of evidence = unknown.
 *
 * Never convert absence of evidence into
 * a false product claim.
 */
function requireEvidence(
  claim,
  where,
  sourceMap,
  errors,
) {
  if (
    !verificationStates.has(
      claim.verificationStatus,
    )
  ) {
    errors.push(
      `${where}.verificationStatus must be verified, likely, or unknown`,
    );

    return;
  }

  if (!Array.isArray(claim.evidence)) {
    errors.push(
      `${where}.evidence must be an array`,
    );
  } else {
    /*
     * ASSERTED CLAIM:
     * verified / likely require >= 1 source.
     *
     * UNKNOWN:
     * evidence: [] is explicitly valid.
     */
    if (
      claim.verificationStatus !== "unknown" &&
      claim.evidence.length === 0
    ) {
      errors.push(
        `${where}.evidence must contain at least one source key for an asserted claim`,
      );
    }

    for (const sourceKey of claim.evidence) {
      if (!sourceMap.has(sourceKey)) {
        errors.push(
          `${where}.evidence references unknown source '${sourceKey}'`,
        );
      }
    }
  }

  if (
    claim.confidence !== undefined &&
    claim.confidence !== null &&
    (
      typeof claim.confidence !== "number" ||
      claim.confidence < 0 ||
      claim.confidence > 1
    )
  ) {
    errors.push(
      `${where}.confidence must be between 0 and 1, null, or omitted`,
    );
  }

  if (
    claim.lastVerifiedAt !== undefined &&
    claim.lastVerifiedAt !== null &&
    !validDate(claim.lastVerifiedAt)
  ) {
    errors.push(
      `${where}.lastVerifiedAt must be an ISO-compatible timestamp, null, or omitted`,
    );
  }
}

export function validateSeedBundle(
  bundle,
) {
  const errors = [];

  if (!isObject(bundle)) {
    return ["root must be an object"];
  }

  if (bundle.version !== 1) {
    errors.push(
      "version must equal 1",
    );
  }

  const collectionNames = [
    "sources",
    "anchors",
    "attributes",
    "problems",
    "audiences",
    "products",
    "escapeRoutes",
  ];

  for (const name of collectionNames) {
    if (!Array.isArray(bundle[name])) {
      errors.push(
        `${name} must be an array`,
      );
    }
  }

  if (errors.length) {
    return errors;
  }

  const sourceMap = uniqueIndex(
    bundle.sources,
    "key",
    "sources",
    errors,
  );

  const anchorMap = uniqueIndex(
    bundle.anchors,
    "slug",
    "anchors",
    errors,
  );

  const attributeMap = uniqueIndex(
    bundle.attributes,
    "slug",
    "attributes",
    errors,
  );

  const problemMap = uniqueIndex(
    bundle.problems,
    "slug",
    "problems",
    errors,
  );

  const audienceMap = uniqueIndex(
    bundle.audiences,
    "slug",
    "audiences",
    errors,
  );

  const productMap = uniqueIndex(
    bundle.products,
    "slug",
    "products",
    errors,
  );

  uniqueIndex(
    bundle.escapeRoutes,
    "slug",
    "escapeRoutes",
    errors,
  );

  /*
   * Evidence sources
   */
  bundle.sources.forEach(
    (source, index) => {
      if (
        !sourceTypes.has(
          source.sourceType,
        )
      ) {
        errors.push(
          `sources[${index}].sourceType is invalid`,
        );
      }

      if (!nonEmpty(source.title)) {
        errors.push(
          `sources[${index}].title is required`,
        );
      }

      if (
        source.url !== undefined &&
        !validHttpUrl(source.url)
      ) {
        errors.push(
          `sources[${index}].url must be http(s)`,
        );
      }

      if (
        !validDate(
          source.retrievedAt,
        )
      ) {
        errors.push(
          `sources[${index}].retrievedAt is required and must be a timestamp`,
        );
      }
    },
  );

  /*
   * Taxonomy
   */
  bundle.anchors.forEach(
    (anchor, index) => {
      requireSlug(
        anchor.slug,
        `anchors[${index}].slug`,
        errors,
      );
    },
  );

  bundle.problems.forEach(
    (problem, index) => {
      requireSlug(
        problem.slug,
        `problems[${index}].slug`,
        errors,
      );
    },
  );

  bundle.audiences.forEach(
    (audience, index) => {
      requireSlug(
        audience.slug,
        `audiences[${index}].slug`,
        errors,
      );
    },
  );

  bundle.attributes.forEach(
    (attribute, index) => {
      requireSlug(
        attribute.slug,
        `attributes[${index}].slug`,
        errors,
      );

      if (
        !valueTypes.has(
          attribute.valueType,
        )
      ) {
        errors.push(
          `attributes[${index}].valueType is invalid`,
        );
      }

      if (
        !/^[a-z][a-z0-9_]*$/.test(
          attribute.category ?? "",
        )
      ) {
        errors.push(
          `attributes[${index}].category is invalid`,
        );
      }
    },
  );

  /*
   * Products
   */
  bundle.products.forEach(
    (product, productIndex) => {
      requireSlug(
        product.slug,
        `products[${productIndex}].slug`,
        errors,
      );

      if (!nonEmpty(product.name)) {
        errors.push(
          `products[${productIndex}].name is required`,
        );
      }

      if (
        product.websiteUrl !== undefined &&
        !validHttpUrl(
          product.websiteUrl,
        )
      ) {
        errors.push(
          `products[${productIndex}].websiteUrl must be http(s)`,
        );
      }

      if (
        !productStatuses.has(
          product.status,
        )
      ) {
        errors.push(
          `products[${productIndex}].status is invalid`,
        );
      }

      const relationshipCollections = [
        "anchors",
        "attributes",
        "problems",
        "audiences",
      ];

      let relationshipShapeInvalid = false;

      for (
        const name
        of relationshipCollections
      ) {
        if (
          !Array.isArray(
            product[name],
          )
        ) {
          errors.push(
            `products[${productIndex}].${name} must be an array`,
          );

          relationshipShapeInvalid = true;
        }
      }

      if (
        relationshipShapeInvalid
      ) {
        return;
      }

      /*
       * Product → Anchor
       */
      product.anchors.forEach(
        (claim, claimIndex) => {
          if (
            !anchorMap.has(
              claim.slug,
            )
          ) {
            errors.push(
              `products[${productIndex}].anchors[${claimIndex}] references unknown anchor '${claim.slug}'`,
            );
          }

          if (
            !relationshipTypes.has(
              claim.relationshipType,
            )
          ) {
            errors.push(
              `products[${productIndex}].anchors[${claimIndex}].relationshipType is invalid`,
            );
          }

          requireEvidence(
            claim,
            `products[${productIndex}].anchors[${claimIndex}]`,
            sourceMap,
            errors,
          );
        },
      );

      /*
       * Product → Attribute
       */
      product.attributes.forEach(
        (claim, claimIndex) => {
          const definition =
            attributeMap.get(
              claim.slug,
            );

          if (!definition) {
            errors.push(
              `products[${productIndex}].attributes[${claimIndex}] references unknown attribute '${claim.slug}'`,
            );
          } else if (
            claim.verificationStatus ===
              "unknown" &&
            claim.value === null
          ) {
            /*
             * Explicit unknown.
             *
             * This is intentionally valid.
             * We do NOT force null into the
             * attribute's normal value type.
             */
          } else {
            const expected =
              definition.valueType;

            const actual =
              typeof claim.value;

            if (
              expected ===
                "boolean" &&
              actual !== "boolean"
            ) {
              errors.push(
                `products[${productIndex}].attributes[${claimIndex}].value must be boolean`,
              );
            }

            if (
              expected ===
                "number" &&
              actual !== "number"
            ) {
              errors.push(
                `products[${productIndex}].attributes[${claimIndex}].value must be number`,
              );
            }

            if (
              (
                expected === "text" ||
                expected === "enum"
              ) &&
              actual !== "string"
            ) {
              errors.push(
                `products[${productIndex}].attributes[${claimIndex}].value must be string`,
              );
            }
          }

          requireEvidence(
            claim,
            `products[${productIndex}].attributes[${claimIndex}]`,
            sourceMap,
            errors,
          );
        },
      );

      /*
       * Product → Problem
       */
      product.problems.forEach(
        (claim, claimIndex) => {
          if (
            !problemMap.has(
              claim.slug,
            )
          ) {
            errors.push(
              `products[${productIndex}].problems[${claimIndex}] references unknown problem '${claim.slug}'`,
            );
          }

          requireEvidence(
            claim,
            `products[${productIndex}].problems[${claimIndex}]`,
            sourceMap,
            errors,
          );
        },
      );

      /*
       * Product → Audience
       */
      product.audiences.forEach(
        (claim, claimIndex) => {
          if (
            !audienceMap.has(
              claim.slug,
            )
          ) {
            errors.push(
              `products[${productIndex}].audiences[${claimIndex}] references unknown audience '${claim.slug}'`,
            );
          }

          requireEvidence(
            claim,
            `products[${productIndex}].audiences[${claimIndex}]`,
            sourceMap,
            errors,
          );
        },
      );
    },
  );

  /*
   * Escape Routes
   */
  bundle.escapeRoutes.forEach(
    (route, routeIndex) => {
      requireSlug(
        route.slug,
        `escapeRoutes[${routeIndex}].slug`,
        errors,
      );

      if (
        route.anchorSlug !==
          undefined &&
        !anchorMap.has(
          route.anchorSlug,
        )
      ) {
        errors.push(
          `escapeRoutes[${routeIndex}].anchorSlug references unknown anchor '${route.anchorSlug}'`,
        );
      }

      if (
        !productStatuses.has(
          route.status,
        )
      ) {
        errors.push(
          `escapeRoutes[${routeIndex}].status is invalid`,
        );
      }

      if (
        typeof route.editoriallyApproved !==
        "boolean"
      ) {
        errors.push(
          `escapeRoutes[${routeIndex}].editoriallyApproved must be boolean`,
        );
      }

      if (
        !Array.isArray(
          route.products,
        )
      ) {
        errors.push(
          `escapeRoutes[${routeIndex}].products must be an array`,
        );
      } else {
        route.products.forEach(
          (
            entry,
            entryIndex,
          ) => {
            if (
              !productMap.has(
                entry.productSlug,
              )
            ) {
              errors.push(
                `escapeRoutes[${routeIndex}].products[${entryIndex}] references unknown product '${entry.productSlug}'`,
              );
            }
          },
        );
      }
    },
  );

  return errors;
}

/*
 * CLI entry point
 */
const invoked =
  process.argv[1] &&
  path.resolve(
    process.argv[1],
  ) ===
    fileURLToPath(
      import.meta.url,
    );

if (invoked) {
  const input =
    process.argv[2] ??
    "seed/fixtures/minimal-valid.json";

  try {
    const bundle =
      loadJson(input);

    const errors =
      validateSeedBundle(
        bundle,
      );

    if (errors.length) {
      fail(errors);
    } else {
      console.log(
        `Seed validation passed: ${input}`,
      );
    }
  } catch (error) {
    fail([
      error.message,
    ]);
  }
}