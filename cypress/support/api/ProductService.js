// cypress/support/api/ProductService.js
import { API_URL } from "../urls";

class ProductService {
  createProduct(token, productData) {
    return cy.request({
      method: "POST",
      url: `${API_URL}/produtos`,
      headers: { authorization: token },
      failOnStatusCode: false,
      body: {
        nome: `${productData.name} ${Date.now()}`, // Adiciona timestamp para garantir unicidade
        preco: productData.price,
        descricao: productData.description,
        quantidade: productData.quantity,
      },
    });
  }

  getProduct(productId) {
    return cy.request({
      method: "GET",
      url: `${API_URL}/produtos/${productId}`,
      failOnStatusCode: false,
    });
  }

  deleteProduct(token, productId) {
    return cy.request({
      method: "DELETE",
      url: `${API_URL}/produtos/${productId}`,
      headers: { authorization: token },
      failOnStatusCode: false,
    });
  }
}

export default new ProductService();
