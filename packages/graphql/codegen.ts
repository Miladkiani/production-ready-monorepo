import type { CodegenConfig } from "@graphql-codegen/cli";
import { existsSync } from "fs";
import { resolve } from "path";

// 🐳 Docker-friendly: Try local schema file first (for Docker/CI builds),
// fall back to HTTP endpoint (for local development)
const schemaFile = resolve(__dirname, "../../apps/backend/src/schema.gql");
const schema = existsSync(schemaFile)
  ? schemaFile
  : process.env.GRAPHQL_SCHEMA_URL || "http://localhost:4000/graphql";

const config: CodegenConfig = {
  schema,
  documents: ["src/**/*.{gql,graphql}"],
  generates: {
    "./src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {
        scalars: {
          Upload: "File",
        },
      },
    },
  },
};

export default config;
