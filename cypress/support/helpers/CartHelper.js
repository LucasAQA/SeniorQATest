import cartService from "../api/CartService";

class CartHelper {
  constructor() {
    this.activeTokens = [];
  }

  trackCart(token) {
    this.activeTokens.push(token);
  }

  teardownCarts() {
    this.activeTokens.forEach((token) => {
      cartService.cancelCart(token).then((response) => {
        expect([200, 404]).to.include(response.status);
      });
    });
    this.activeTokens = [];
  }
}

export default new CartHelper();
