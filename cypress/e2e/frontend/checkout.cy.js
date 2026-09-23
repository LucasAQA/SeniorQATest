import userHelper from "../../support/helpers/UserHelper";
import productHelper from "../../support/helpers/ProductHelper";
import loginPage from "../../support/pages/LoginPage";
import clientHomePage from "../../support/pages/ClientHomePage";
import shoppingCartPage from "../../support/pages/ShoppingCartPage";
import user from "../../fixtures/user.json";
import product from "../../fixtures/product.json";
import messages from "../../fixtures/messages.json";
import { urls } from "../../support/urls";

describe("Frontend - Shopping Cart and Checkout", () => {
  const dynamicProductName = `${product.name} Checkout ${Date.now()}`;
  const checkoutProduct = { ...product, name: dynamicProductName };

  before(() => {
    userHelper.setupUser(user.valid);
    cy.apiLogin(user.valid.email, user.valid.password).then((token) => {
      productHelper.setupProduct(token, checkoutProduct).then((id) => {
        cy.wrap(id).as("productId");
      });
    });
    userHelper.setupUser(user.standard);
  });

  after(() => {
    productHelper.teardownProducts();
    userHelper.teardownUsers();
  });

  beforeEach(() => {
    cy.session("clientSession", () => {
      cy.intercept("POST", urls.apiIntercepts.login).as("loginRequest");

      loginPage.visit();
      loginPage.fillCredentials(user.standard.email, user.standard.password);
      loginPage.submit();

      cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
      cy.get('[data-testid="logout"]').should("be.visible");
    });
  });

  const adicionarProdutoAoCarrinhoUI = () => {
    cy.intercept("GET", urls.apiIntercepts.products).as("loadProducts");
    cy.visit(urls.ui.clientHome);
    cy.wait("@loadProducts").its("response.statusCode").should("eq", 200);

    clientHomePage.addSpecificProductToCart(dynamicProductName);
    clientHomePage.accessCart();
  };

  // Valida a adição de produto ao carrinho via frontend e a correção do payload
  it("should successfully add a product to the shopping cart", () => {
    adicionarProdutoAoCarrinhoUI();
    shoppingCartPage.validateProductInCart(dynamicProductName);
  });

  // Valida o checkout com produto no carrinho e a correção do payload
  it("should successfully checkout with a product in the cart", function () {
    adicionarProdutoAoCarrinhoUI();

    cy.intercept("POST", urls.apiIntercepts.carts).as("checkoutRequest");
    shoppingCartPage.checkout();

    cy.wait("@checkoutRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(201);

      expect(interception.request.body)
        .to.have.property("produtos")
        .that.is.an("array").and.is.not.empty;
      expect(interception.request.body.produtos[0].idProduto).to.eq(
        this.productId,
      );
      expect(interception.request.body.produtos[0].quantidade).to.eq(1);
    });

    cy.get("h1").contains(messages.ui.clientTitle).should("be.visible");
  });
});
