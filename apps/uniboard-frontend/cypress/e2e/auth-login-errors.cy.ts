describe("Login validations", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("rejects invalid credentials with an error message", () => {
    const unique = Date.now();
    const email = `missing-${unique}@example.com`;

    cy.visit("/login");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type("WrongPassword!1");
    cy.contains("button", "Zaloguj").click();

    cy.contains("Invalid credentials", { timeout: 10000 }).should("be.visible");
    cy.url().should("include", "/login");
  });
});
