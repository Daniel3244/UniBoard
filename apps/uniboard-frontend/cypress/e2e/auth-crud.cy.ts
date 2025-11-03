describe("Authentication and task CRUD flow", () => {
  it("logs in as admin and manages a task", () => {
    const unique = Date.now();
    const projectName = `Project ${unique}`;
    const taskTitle = `Task ${unique}`;
    const adminEmail = Cypress.env("adminEmail") as string;
    const adminPassword = Cypress.env("adminPassword") as string;

    cy.visit("/login");
    cy.get('input[type="email"]').type(adminEmail);
    cy.get('input[type="password"]').type(adminPassword);
    cy.contains("button", "Zaloguj").click();

    cy.url({ timeout: 10000 }).should("include", "/dashboard");
    cy.contains("Projects").should("be.visible");

    cy.get('input[name="projectName"]').type(projectName);
    cy.get('textarea[name="projectDescription"]').type("E2E description");
    cy.contains("button", "Add project").click();

    cy.get(
      `[data-testid="project-item"][data-project-name="${projectName}"]`,
      { timeout: 10000 },
    )
      .should("be.visible")
      .click();

    cy.contains('[role="tab"]', "Add task").click();
    cy.get('input[name="taskTitle"]').type(taskTitle);
    cy.get('input[name="taskTitle"]')
      .closest("form")
      .within(() => {
        cy.contains("button", "Add task").click();
      });

    cy.contains('[role="tab"]', "Tasks").should(
      "have.attr",
      "aria-selected",
      "true",
    );

    cy.contains('[data-testid^="task-item"]', taskTitle, {
      timeout: 10000,
    }).should("be.visible");

    cy.contains('[data-testid^="task-item"]', taskTitle)
      .find('[data-testid^="task-status"]')
      .click();
    cy.contains('li[role="option"]', "In Progress").click();
    cy.contains('[data-testid^="task-item"]', taskTitle).within(() => {
      cy.get(".MuiChip-label").should("contain.text", "In Progress");
    });

    cy.contains('[data-testid^="task-item"]', taskTitle)
      .find('button[aria-label="delete"]')
      .click();

    cy.contains('[data-testid^="task-item"]', taskTitle, {
      timeout: 10000,
    }).should("not.exist");
  });
});
