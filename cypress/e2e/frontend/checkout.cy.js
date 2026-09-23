import userHelper from "../../support/helpers/UserHelper";
import productHelper from "../../support/helpers/ProductHelper";
import loginPage from "../../support/pages/LoginPage";
import clientHomePage from "../../support/pages/ClientHomePage";
import shoppingCartPage from "../../support/pages/ShoppingCartPage";
import user from "../../fixtures/user.json";
import product from "../../fixtures/product.json";

describe("Frontend - Shopping Cart and Checkout", () => {
  const dynamicProductName = `${product.name} Checkout ${Date.now()}`;
  const checkoutProduct = { ...product, name: dynamicProductName };

  before(() => {
    userHelper.setupUser(user.valid);
    cy.apiLogin(user.valid.email, user.valid.password).then((token) => {
      productHelper.setupProduct(token, checkoutProduct);
    });
    userHelper.setupUser(user.standard);
  });

  after(() => {
    productHelper.teardownProducts();
    userHelper.teardownUsers();
  });

  beforeEach(() => {
    cy.session("clientSession", () => {
      cy.intercept("POST", "**/login").as("loginRequest");

      loginPage.visit();
      loginPage.fillCredentials(user.standard.email, user.standard.password);
      loginPage.submit();

      cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
      cy.get('[data-testid="logout"]').should("be.visible");
    });
  });

  it("should allow a standard user to add a product to the cart and checkout", () => {
    cy.intercept("GET", "**/produtos").as("loadProducts");
    cy.visit("/home");
    cy.wait("@loadProducts").its("response.statusCode").should("eq", 200);

    clientHomePage.addSpecificProductToCart(dynamicProductName);
    clientHomePage.accessCart();

    shoppingCartPage.validateProductInCart(dynamicProductName);

    cy.intercept("POST", "**/carrinhos").as("checkoutRequest");
    shoppingCartPage.checkout();

    cy.wait("@checkoutRequest").its("response.statusCode").should("eq", 201);
    cy.get("h1").contains("Serverest Store").should("be.visible");
  });
});
