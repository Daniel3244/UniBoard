describe("Registration flow", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("creates a new account and redirects to dashboard", () => {
    const unique = Date.now();
    const email = `new-user-${unique}@example.com`;
    const password = `SecurePass!${unique}`;

    cy.visit("/register");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').first().type(password);
    cy.get('input[type="password"]').last().type(password);
    cy.contains("button", "Zarejestruj").click();

    cy.url({ timeout: 10000 }).should("include", "/dashboard");
    cy.contains("Welcome").should("contain.text", email);
  });

  it("shows validation error for mismatched passwords", () => {
    cy.visit("/register");
    cy.get('input[type="email"]').type("mismatch@example.com");
    cy.get('input[type="password"]').first().type("Password!1");
    cy.get('input[type="password"]').last().type("Password!2");
    cy.contains("button", "Zarejestruj").click();

    cy.contains("Hasła muszą być identyczne.").should("be.visible");
    cy.url().should("include", "/register");
  });
});
