import credentials from "../fixtures/credentials.json";

describe("Expired token", () => {
  // test detected bug
  // we suppose to be redirected to login page
  it("Redirect to login page if token is expired", () => {
    cy.apiLogin(credentials.email, credentials.password);
    cy.clearCookies();
    cy.visit("/profile");
    cy.url().should("include", "/login");
  });
});

export {};
