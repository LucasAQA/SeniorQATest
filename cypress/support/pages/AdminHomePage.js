class AdminHomePage {
  navigateToAddProduct() {
    cy.get('[data-testid="cadastrar-produtos"]').click();
  }

  navigateToListProducts() {
    cy.get('[data-testid="listar-produtos"]').click();
  }
}

export default new AdminHomePage();
