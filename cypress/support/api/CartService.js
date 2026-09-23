import { API_URL } from "../urls";

class CartService {
  createCart(token, productId, quantity) {
    return cy.request({
      method: "POST",
      url: `${API_URL}/carrinhos`,
      headers: { authorization: token },
      failOnStatusCode: false,
      body: {
        produtos: [
          {
            idProduto: productId,
            quantidade: quantity,
          },
        ],
      },
    });
  }

  cancelCart(token) {
    return cy.request({
      method: "DELETE",
      url: `${API_URL}/carrinhos/cancelar-compra`,
      headers: { authorization: token },
      failOnStatusCode: false,
    });
  }
}

export default new CartService();
