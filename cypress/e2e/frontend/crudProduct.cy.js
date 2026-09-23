import userHelper from "../../support/helpers/UserHelper";
import productHelper from "../../support/helpers/ProductHelper";
import loginPage from "../../support/pages/LoginPage";
import adminHomePage from "../../support/pages/AdminHomePage";
import productPage from "../../support/pages/ProductPage";
import user from "../../fixtures/user.json";
import product from "../../fixtures/product.json";

describe("Frontend - Admin Product Management", () => {
  before(() => {
    userHelper.setupUser(user.valid);
  });

  after(() => {
    productHelper.teardownProducts();
    userHelper.teardownUsers();
  });

  beforeEach(() => {
    cy.session("adminSession", () => {
      cy.intercept("POST", "**/login").as("loginRequest");

      loginPage.visit();
      loginPage.fillCredentials(user.valid.email, user.valid.password);
      loginPage.submit();

      cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
      cy.get('[data-testid="logout"]').should("be.visible");
    });
  });

  it("should successfully authenticate and load the dashboard", () => {
    cy.visit("/admin/home");
    cy.get("h1").contains("Bem Vindo").should("be.visible");
  });

  it("should register a new product via UI", () => {
    const dynamicProductName = `${product.name} Cadastrado ${Date.now()}`;
    const dynamicProduct = { ...product, name: dynamicProductName };

    cy.visit("/admin/home");
    adminHomePage.navigateToAddProduct();

    cy.intercept("POST", "**/produtos").as("createProductRequest");

    productPage.fillProductDetails(dynamicProduct);
    productPage.submit();

    cy.wait("@createProductRequest")
      .its("response.statusCode")
      .should("eq", 201);
    cy.contains("td", dynamicProductName).should("be.visible");
  });

  it("should delete a product via UI", () => {
    const productToDelete = { ...product, name: `Para Deletar ${Date.now()}` };

    cy.apiLogin(user.valid.email, user.valid.password).then((token) => {
      productHelper.setupProduct(token, productToDelete).then((id) => {
        cy.wrap(id).as("deleteProductId");
      });
    });

    cy.intercept("GET", "**/produtos").as("loadProducts");

    cy.visit("/admin/home");
    adminHomePage.navigateToListProducts();

    cy.wait("@loadProducts").its("response.statusCode").should("eq", 200);
    cy.contains("td", productToDelete.name).should("be.visible");

    cy.get("@deleteProductId").then((id) => {
      cy.intercept("DELETE", `**/produtos/${id}`).as("deleteProductRequest");
    });

    productPage.deleteProductFromList(productToDelete.name);

    cy.wait("@deleteProductRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.contains("td", productToDelete.name).should("not.exist");
  });

  it("should edit a product via UI", () => {
    const editProduct = { ...product, name: `Para Editar ${Date.now()}` };

    cy.apiLogin(user.valid.email, user.valid.password).then((token) => {
      productHelper.setupProduct(token, editProduct).then((id) => {
        cy.wrap(id).as("editProductId");
      });
    });

    cy.intercept("GET", "**/produtos").as("loadProducts");
    cy.visit("/admin/home");
    adminHomePage.navigateToListProducts();
    cy.wait("@loadProducts");

    cy.get("@editProductId").then((id) => {
      cy.intercept("GET", `**/produtos/${id}`).as("fetchProductDetails");
    });

    productPage.editProductFromList(editProduct.name);

    cy.wait("@fetchProductDetails", { timeout: 4000 });
  });

  it("should render valid images for products in the list", () => {
    const imageProduct = { ...product, name: `Teste Imagem ${Date.now()}` };

    cy.apiLogin(user.valid.email, user.valid.password).then((token) => {
      productHelper.setupProduct(token, imageProduct);
    });

    cy.intercept("GET", "**/produtos").as("loadProductsForImages");
    cy.visit("/admin/home");
    adminHomePage.navigateToListProducts();
    cy.wait("@loadProductsForImages")
      .its("response.statusCode")
      .should("eq", 200);

    cy.contains("tr", imageProduct.name)
      .find("img")
      .should("be.visible")
      .and((img) => {
        expect(img[0].naturalWidth).to.be.greaterThan(
          0,
          "A imagem do produto está quebrada",
        );
      });
  });
});
