import userHelper from "../../support/helpers/UserHelper";
import productHelper from "../../support/helpers/ProductHelper";
import loginPage from "../../support/pages/LoginPage";
import adminHomePage from "../../support/pages/AdminHomePage";
import productPage from "../../support/pages/ProductPage";
import user from "../../fixtures/user.json";
import product from "../../fixtures/product.json";
import messages from "../../fixtures/messages.json";
import { urls } from "../../support/urls";

describe("Frontend - UI Security & Edge Cases (Known Bugs)", () => {
  const dynamicProduct = { ...product, name: `Alvo Exclusão ${Date.now()}` };
  let productId;

  before(() => {
    userHelper.setupUser(user.valid);
    cy.apiLogin(user.valid.email, user.valid.password).then((token) => {
      productHelper.setupProduct(token, dynamicProduct).then((id) => {
        productId = id;
      });
    });
    userHelper.setupUser(user.standard);
  });

  after(() => {
    productHelper.teardownProducts();
    userHelper.teardownUsers();
  });

  // Valida logout ou aviso ao usuário ao tentar deletar com token expirado
  it("should logout or warn user when attempting to delete with an expired token", () => {
    cy.intercept("POST", urls.apiIntercepts.login).as("loginRequest");
    loginPage.visit();
    loginPage.fillCredentials(user.valid.email, user.valid.password);
    loginPage.submit();
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);

    cy.intercept("GET", urls.apiIntercepts.products).as("loadProducts");
    adminHomePage.navigateToListProducts();
    cy.wait("@loadProducts").its("response.statusCode").should("eq", 200);

    cy.contains("td", dynamicProduct.name).should("be.visible");

    cy.window().then((win) => {
      win.localStorage.setItem(
        messages.storage.tokenKey,
        messages.storage.expiredToken,
      );
    });

    cy.intercept("DELETE", urls.apiIntercepts.productById(productId)).as(
      "deleteProductRequest",
    );
    productPage.deleteProductFromList(dynamicProduct.name);

    cy.wait("@deleteProductRequest")
      .its("response.statusCode")
      .should("eq", 401);

    cy.url().should("include", urls.ui.login);
  });

  // Valida que usuários padrão não podem acessar rotas de admin via manipulação de URL
  it("should prevent standard users from accessing admin routes via URL manipulation", () => {
    cy.intercept("POST", urls.apiIntercepts.login).as("loginRequest");
    loginPage.visit();
    loginPage.fillCredentials(user.standard.email, user.standard.password);
    loginPage.submit();
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);

    cy.url().should("include", urls.ui.clientHome);

    cy.visit(urls.ui.adminHome);

    cy.url().should("not.include", urls.ui.adminHome);
    cy.get("h1").contains(messages.ui.clientTitle).should("be.visible");
  });
});
