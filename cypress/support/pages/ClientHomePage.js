class ClientHomePage {
  addSpecificProductToCart(productName) {
    cy.contains(".card", productName).contains("Adicionar a lista").click();
  }

  accessCart() {
    cy.get('[data-testid="carrinho"]').click();
  }
}

export default new ClientHomePage();
