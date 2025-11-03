declare global {
  namespace Cypress {
    interface Chainable {
      registerUser(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("registerUser", (email: string, password: string) => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/api/auth/register`,
    body: { email, password, confirmPassword: password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200 && response.status !== 409) {
      throw new Error(
        `Registration failed with status ${response.status}: ${response.body}`,
      );
    }
  });
});

export {};
