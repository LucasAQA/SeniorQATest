import userHelper from "../../support/helpers/UserHelper";
import productHelper from "../../support/helpers/ProductHelper";
import productService from "../../support/api/ProductService";
import user from "../../fixtures/user.json";
import product from "../../fixtures/product.json";
import messages from "../../fixtures/messages.json";

describe("API - Role-Based Access Control (RBAC)", () => {
  beforeEach(() => {
    userHelper.setupUser(user.valid); // Configura Admin
    userHelper.setupUser(user.standard); // Configura Padrão

    cy.apiLogin(user.valid.email, user.valid.password).then((token) => {
      cy.wrap(token).as("adminToken");
    });

    cy.apiLogin(user.standard.email, user.standard.password).then((token) => {
      cy.wrap(token).as("standardToken");
    });
  });

  afterEach(() => {
    productHelper.teardownProducts();
    userHelper.teardownUsers();
  });

  // Valida que usuários admin podem acessar rotas restritas com sucesso
  it("should allow admin user to access restricted routes successfully", function () {
    productService.createProduct(this.adminToken, product).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.message).to.eq("Cadastro realizado com sucesso");
    });
  });

  // Valida que usuários padrão não podem acessar rotas de admin
  it("should block standard user from accessing admin-only routes", function () {
    productService
      .createProduct(this.standardToken, product)
      .then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body.message).to.eq(messages.rbac.adminOnly);
      });
  });
});
