class LoginPage {
  visit() {
    cy.visit("/login");
  }

  fillCredentials(email, password) {
    cy.get('[data-testid="email"]').type(email);
    cy.get('[data-testid="senha"]').type(password, { log: false }); // log: false oculta a password no terminal
  }

  submit() {
    cy.get('[data-testid="entrar"]').click();
  }
}

export default new LoginPage();
