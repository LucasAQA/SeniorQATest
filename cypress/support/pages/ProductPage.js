class ProductPage {
  fillProductDetails(productData) {
    cy.get('[data-testid="nome"]').type(productData.name);
    cy.get('[data-testid="preco"]').type(productData.price);
    cy.get('[data-testid="descricao"]').type(productData.description);
    cy.get('[data-testid="quantity"]').type(productData.quantity);
  }

  submit() {
    cy.get('[data-testid="cadastarProdutos"]').click();
  }

  deleteProductFromList(productName) {
    cy.contains("tr", productName).find("button").contains("Excluir").click();
  }
  editProductFromList(productName) {
    cy.contains("tr", productName).find("button").contains("Editar").click();
  }
  uploadImage(fixturePath) {
    // Busca o input do tipo 'file' e anexa o arquivo da fixture
    // O { force: true } às vezes é necessário se o input de arquivo original estiver oculto por CSS
    cy.get('input[type="file"]').selectFile(fixturePath, { force: true });
  }
}

export default new ProductPage();
