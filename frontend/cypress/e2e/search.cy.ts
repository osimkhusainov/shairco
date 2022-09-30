describe("Search page", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.intercept(apiUrl + "/search").as("notes");
    cy.get('a:contains("Search")').click();
  });
  const apiUrl = Cypress.env("apiUrl");

  it("Compare notes length from UI and API response", () => {
    cy.findByTestId("note")
      .then((notes: any) => Cypress._.map(notes))
      .then((notes) => {
        cy.wait("@notes").then(({ response }) => {
          expect(notes).have.length(response?.body.length);
        });
      });
  });

  // This test detected bug with 404 page. I have not fixed it inside frontend or backend folders
  it("Search particular note and click", () => {
    cy.findByTestId("note")
      .first()
      .then((note) => {
        cy.wrap(note)
          .find("p")
          .invoke("text")
          .then((text) => {
            cy.findByInputName("searchText").type(text);
            cy.findByTestId("note").should("have.length", 1);
          });
        cy.wrap(note).click();
      });
    cy.get("#__next")
      .should("be.visible")
      .and("not.include.text", "This page could not be found.");
  });

  // This test detected bug if write anything except first name, no one note will return
  it("Search note by owner's last name", () => {
    cy.findByInputName("searchOwner").type("Doe");
    cy.findByTestId("note").should("not.have.length", 0);
  });
});

export {};
