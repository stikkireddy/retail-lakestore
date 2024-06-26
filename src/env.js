import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABRICKS_OPENAI_URL: z.string(),
    DATABRICKS_OPENAI_TOKEN: z.string(),
    DATABRICKS_DATA_SERVER_HOSTNAME: z.string(),
    DATABRICKS_DATA_TOKEN: z.string(),
    DATABRICKS_DATA_HTTP_PATH: z.string(),
    DATABRICKS_VECTOR_INDEX_NAME: z.string(),
    DATABRICKS_PRODUCT_TABLE: z.string(),
    DATABRICKS_FORECAST_TABLE: z.string(),
    DATABRICKS_VECTOR_INDEX_COLUMNS: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABRICKS_OPENAI_URL: process.env.DATABRICKS_OPENAI_URL,
    DATABRICKS_OPENAI_TOKEN: process.env.DATABRICKS_OPENAI_TOKEN,
    DATABRICKS_DATA_SERVER_HOSTNAME: process.env.DATABRICKS_DATA_SERVER_HOSTNAME,
    DATABRICKS_DATA_TOKEN: process.env.DATABRICKS_DATA_TOKEN,
    DATABRICKS_DATA_HTTP_PATH: process.env.DATABRICKS_DATA_HTTP_PATH,
    DATABRICKS_VECTOR_INDEX_NAME: process.env.DATABRICKS_VECTOR_INDEX_NAME,
    DATABRICKS_VECTOR_INDEX_COLUMNS: process.env.DATABRICKS_VECTOR_INDEX_COLUMNS,
    DATABRICKS_PRODUCT_TABLE: process.env.DATABRICKS_PRODUCT_TABLE,
    DATABRICKS_FORECAST_TABLE: process.env.DATABRICKS_FORECAST_TABLE,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
