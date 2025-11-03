import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    env: {
      apiUrl: process.env.CYPRESS_API_URL ?? "http://localhost:5174",
      adminEmail: process.env.CYPRESS_ADMIN_EMAIL ?? "admin@uniboard.dev",
      adminPassword: process.env.CYPRESS_ADMIN_PASSWORD ?? "Admin!12345",
    },
  },
  video: false,
});
