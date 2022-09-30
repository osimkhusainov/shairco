import credentials from "../fixtures/credentials.json";

describe("Login page", () => {
  const apiUrl = Cypress.env("apiUrl");
  beforeEach(() => cy.visit("/login"));

  it("Login to profile with valid credentials", () => {
    cy.intercept(apiUrl + "/login").as("login");
    cy.uiLogin(credentials.email, credentials.password);
    cy.wait("@login").then(({ response }) => {
      expect(response?.body.authenticated).true;
    });
    cy.findByTestId("title").should("have.text", "Testing!");
    cy.get("a:contains('Profile')").should("be.visible");
  });

  it("Login to profile with unvalid credentials", () => {
    cy.uiLogin("osim@email.com", "123");
    cy.get("form").should(
      "contain.text",
      "Your username or password was incorrect. Please try again."
    );
  });

  it("Login to profile with empty credentials", () => {
    cy.uiLogin(" ", " ");
    cy.get("form").should(
      "contain.text",
      "Your username or password are empty. Please fill all fields and try again."
    );
  });
});
