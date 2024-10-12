//drizzle.config.ts
import { defineConfig, type Config } from 'drizzle-kit';

export default defineConfig({
  schema: './app/api/schema.ts',
  out: './drizzle',
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
    