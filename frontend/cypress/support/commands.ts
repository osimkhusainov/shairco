/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
export {};
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.findByInputName('email')
       */
      findByTestId(value: string): Chainable<Element>;
      getIframe(iframe: string): Chainable<Element>;
      findByInputName(name: string): Chainable<Element>;
      uiLogin(email: string, password: any): Chainable<Element>;
      apiLogin(email: string, password: any): Chainable<Element>;
    }
  }
}

Cypress.Commands.add("findByTestId", (value) => {
  cy.get(`[test-id=${value}]`);
});

Cypress.Commands.add("uiLogin", (email, password) => {
  cy.findByInputName("email").should("be.empty").type(email);
  cy.findByInputName("password").should("be.empty").type(password);
  cy.findByInputName("submit").click();
});

Cypress.Commands.add("apiLogin", (email, password) => {
  cy.request({
    method: "POST",
    url: Cypress.env("apiUrl") + "/login",
    body: { email, password },
  }).then((response) => {
    cy.setCookie("token", response.body.token);
    expect(response.status).to.eq(200);
  });
});

Cypress.Commands.add("findByInputName", (name) => {
  cy.get(`input[name=${name}]`);
});
