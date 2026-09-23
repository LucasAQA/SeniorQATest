import userHelper from "../../support/helpers/UserHelper";
import productHelper from "../../support/helpers/ProductHelper";
import cartHelper from "../../support/helpers/CartHelper";
import cartService from "../../support/api/CartService";
import productService from "../../support/api/ProductService";
import user from "../../fixtures/user.json";
import product from "../../fixtures/product.json";
import messages from "../../fixtures/messages.json";

describe("API - Cart and Inventory Integration", () => {
  beforeEach(() => {
    userHelper.setupUser(user.valid);
    cy.apiLogin(user.valid.email, user.valid.password).then((token) => {
      cy.wrap(token).as("authToken");
      productHelper.setupProduct(token, product).then((productId) => {
        cy.wrap(productId).as("productId");
      });
    });
  });

  afterEach(() => {
    cartHelper.teardownCarts();
    productHelper.teardownProducts();
    userHelper.teardownUsers();
  });

  it("should successfully create a cart with valid payload", function () {
    cartService
      .createCart(this.authToken, this.productId, product.purchaseQuantity)
      .then((cartRes) => {
        expect(cartRes.status).to.eq(201);
        expect(cartRes.body.message).to.eq(messages.cart.creationSuccess);
        cartHelper.trackCart(this.authToken);
      });
  });

  it("should dynamically deduct product inventory after cart creation", function () {
    cartService
      .createCart(this.authToken, this.productId, product.purchaseQuantity)
      .then(() => {
        cartHelper.trackCart(this.authToken);

        productService.getProduct(this.productId).then((prodRes) => {
          expect(prodRes.status).to.eq(200);
          const expectedQuantity = product.quantity - product.purchaseQuantity;
          expect(prodRes.body.quantidade).to.eq(expectedQuantity);
        });
      });
  });

  it("should block cart creation if purchase quantity exceeds inventory", function () {
    cartService
      .createCart(this.authToken, this.productId, product.overLimitQuantity)
      .then((cartRes) => {
        expect(cartRes.status).to.eq(400);
        expect(cartRes.body.message).to.eq(messages.cart.insufficientStock);
      });
  });
});
