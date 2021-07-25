describe("testing auth", () => {
  it(`render login page`, () => {
    cy.visit("/");
    cy.wait(5000);
    cy.contains("Username");
    cy.contains("Pin");
    cy.get('input[name*="username"]').clear().type("thomas_sankara");
    cy.get('input[name*="pin"]').clear().type("1711");
    cy.get('button[type*="button"]').click();
    cy.wait(10000);
    cy.contains(`Failure: User does not Exist or Incorrect username`);
    cy.get('input[name*="username"]').clear().type("castro");
    cy.get('input[name*="pin"]').clear().type("1711");
    cy.get('button[type*="button"]').click();
    cy.url({ timeout: 20000 }).should("eq", Cypress.config().baseUrl + "/sell/sell");
  });
});
