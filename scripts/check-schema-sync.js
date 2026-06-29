#!/usr/bin/env node
/**
 * Pre-commit hook to ensure GraphQL schema.gql is updated when backend changes
 * This prevents Docker builds from using stale schema files
 *
 * Based on GraphMessenger architecture
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("📋 Checking GraphQL schema synchronization...");

try {
  // Get list of staged files
  const stagedFiles = execSync("git diff --cached --name-only", {
    encoding: "utf-8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  if (stagedFiles.length === 0) {
    console.log("✅ No staged files to check");
    process.exit(0);
  }

  // Check if any backend GraphQL files changed
  const backendGraphQLChanged = stagedFiles.some(
    (file) =>
      file.startsWith("apps/backend/src/") &&
      !file.includes("schema.gql") &&
      (file.endsWith(".resolver.ts") ||
        file.endsWith(".entity.ts") ||
        file.endsWith(".model.ts") ||
        file.endsWith(".dto.ts") ||
        file.endsWith(".input.ts") ||
        file.includes("/graphql/")),
  );

  // Check if schema.gql is staged
  const schemaChanged = stagedFiles.includes("apps/backend/src/schema.gql");

  if (backendGraphQLChanged && !schemaChanged) {
    console.error("");
    console.error(
      "❌ ERROR: Backend GraphQL files changed but schema.gql was not updated!",
    );
    console.error("");
    console.error("📝 Files changed:");
    stagedFiles
      .filter((f) => f.startsWith("apps/backend/src/"))
      .forEach((f) => console.error(`   - ${f}`));
    console.error("");
    console.error("🔧 To fix this, run:");
    console.error("   pnpm schema:generate");
    console.error("   git add apps/backend/src/schema.gql");
    console.error("");
    console.error(
      "💡 This ensures Docker builds use the latest GraphQL schema",
    );
    console.error("");
    process.exit(1);
  }

  if (schemaChanged && !backendGraphQLChanged) {
    console.log(
      "⚠️  Warning: schema.gql changed but no backend files modified",
    );
    console.log("   This is okay if you manually updated the schema");
  }

  console.log("✅ GraphQL schema check passed");
  process.exit(0);
} catch (error) {
  console.error("⚠️  Could not check schema sync:", error.message);
  console.log(
    "⏭️  Skipping check (not in a git repository or git not available)",
  );
  process.exit(0); // Don't fail the commit if git commands fail
}
