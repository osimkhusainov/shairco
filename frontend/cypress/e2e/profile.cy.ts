import credentials from "../fixtures/credentials.json";

describe("Login page", () => {
  const apiUrl = Cypress.env("apiUrl");
  beforeEach(() => {
    cy.intercept(apiUrl + "/profile").as("profile");
    cy.apiLogin(credentials.email, credentials.password);
    cy.visit("/profile");
  });

  it.skip("Check notes length from UI and API, create new Note", () => {
    cy.wait("@profile").then(({ response }) => {
      cy.findByTestId("note")
        .then((notes: any) => Cypress._.map(notes))
        .then((notes) => {
          expect(notes).have.length(response?.body.notes.length);

          cy.log("Create new note");
          cy.get("#searchText").should("be.empty").type("Test note");
          cy.findByInputName("submit").click();
          cy.findByTestId("note").should("have.length", notes.length + 1);
        });
    });
  });

  it("Check one note and compare data from UI and API", () => {
    cy.wait("@profile").then(({ response }) => {
      const { id, text } = response?.body.notes[0];
      const { firstName, lastName } = response?.body.user;
      cy.findByTestId("note")
        .first()
        .then((note) => {
          cy.wrap(note).find("h2").should("contain.text", id);
          cy.wrap(note)
            .find("h4")
            .should("contain.text", `${firstName} ${lastName}`);
          cy.wrap(note)
            .find("p")
            .should("contain.text", text.slice(0, text.indexOf("\n")));
        });
    });
  });

  it("Open particular note", () => {
    cy.intercept(apiUrl + "/note/*").as("note");
    cy.wait("@profile").then(() => {
      cy.findByTestId("note").first().click();
    });
    cy.wait("@note").then(({ response }) => {
      const { id, text } = response?.body;
      cy.get("h1").should("have.text", `Note: ${id}`);
      cy.get("p").should("contain.text", text.slice(0, text.indexOf("\n")));
    });
  });
});
