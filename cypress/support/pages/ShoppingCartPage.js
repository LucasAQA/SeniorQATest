class ShoppingCartPage {
  validateProductInCart(productName) {
    cy.contains("h1", "Lista de Compras").should("be.visible");
    cy.contains(productName).should("be.visible");
  }

  checkout() {
    cy.contains("button", "Finalizar Compra").click();
  }
}

export default new ShoppingCartPage();
