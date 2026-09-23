import userHelper from "../../support/helpers/UserHelper";
import productService from "../../support/api/ProductService";
import user from "../../fixtures/user.json";
import product from "../../fixtures/product.json";

describe("API - Role-Based Access Control (RBAC)", () => {
  before(() => {
    userHelper.setupUser(user.standard);
    cy.apiLogin(user.standard.email, user.standard.password).then((token) => {
      cy.wrap(token).as("standardToken");
    });
  });

  after(() => {
    userHelper.teardownUsers();
  });

  it("should block standard user from accessing admin-only routes", function () {
    productService
      .createProduct(this.standardToken, product)
      .then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body.message).to.eq(
          "Rota exclusiva para administradores",
        );
      });
  });
});
