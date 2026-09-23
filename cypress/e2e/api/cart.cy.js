import userHelper from "../../support/helpers/UserHelper";
import productHelper from "../../support/helpers/ProductHelper";
import cartHelper from "../../support/helpers/CartHelper";
import cartService from "../../support/api/CartService";
import productService from "../../support/api/ProductService";
import user from "../../fixtures/user.json";
import product from "../../fixtures/product.json";

describe("API - Cart and Inventory Integration", () => {
  const purchaseQuantity = 2;

  before(() => {
    userHelper.setupUser(user.valid);

    cy.apiLogin(user.valid.email, user.valid.password).then((token) => {
      cy.wrap(token).as("authToken");
      cartHelper.trackCart(token);

      productHelper.setupProduct(token, product).then((productId) => {
        cy.wrap(productId).as("productId");
      });
    });
  });

  after(() => {
    cartHelper.teardownCarts();
    productHelper.teardownProducts();
    userHelper.teardownUsers();
  });

  it("should create a cart and dynamically deduct product inventory", function () {
    cartService
      .createCart(this.authToken, this.productId, purchaseQuantity)
      .then((cartRes) => {
        expect(cartRes.status).to.eq(201);
        expect(cartRes.body.message).to.eq("Cadastro realizado com sucesso");
        productService.getProduct(this.productId).then((prodRes) => {
          expect(prodRes.status).to.eq(200);
          const expectedQuantity = product.quantity - purchaseQuantity;
          expect(prodRes.body.quantidade).to.eq(expectedQuantity);
        });
      });
  });
});
