import userHelper from "../../support/helpers/UserHelper";
import productHelper from "../../support/helpers/ProductHelper";
import loginPage from "../../support/pages/LoginPage";
import adminHomePage from "../../support/pages/AdminHomePage";
import productPage from "../../support/pages/ProductPage";
import user from "../../fixtures/user.json";
import product from "../../fixtures/product.json";
import messages from "../../fixtures/messages.json";
import { urls } from "../../support/urls";

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
      cy.intercept("POST", urls.apiIntercepts.login).as("loginRequest");

      loginPage.visit();
      loginPage.fillCredentials(user.valid.email, user.valid.password);
      loginPage.submit();

      cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
      cy.get('[data-testid="logout"]').should("be.visible");
    });
  });

  // Valida o login e o dashboard de Admin
  it("should successfully authenticate and load the dashboard", () => {
    cy.visit(urls.ui.adminHome);
    cy.get("h1").contains(messages.ui.adminTitle).should("be.visible");
  });

  // Valida a criação de produto via frontend e a correção do payload
  it("should create product via UI", () => {
    const dynamicProductName = `${product.name} Cadastrado ${Date.now()}`;
    const dynamicProduct = { ...product, name: dynamicProductName };

    cy.visit(urls.ui.adminHome);
    adminHomePage.navigateToAddProduct();

    cy.intercept("POST", urls.apiIntercepts.products).as(
      "createProductRequest",
    );

    productPage.fillProductDetails(dynamicProduct);
    productPage.submit();

    cy.wait("@createProductRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(201);
      expect(interception.request.body.nome).to.eq(dynamicProduct.name);
      expect(interception.request.body.preco).to.eq(dynamicProduct.price);
      expect(interception.request.body.descricao).to.eq(
        dynamicProduct.description,
      );
      expect(interception.request.body.quantidade).to.eq(
        dynamicProduct.quantity,
      );
    });

    cy.contains("tr", dynamicProduct.name).within(() => {
      cy.contains("td", dynamicProduct.name).should("be.visible");
      cy.contains("td", dynamicProduct.description).should("be.visible");
      cy.contains("td", dynamicProduct.price).should("be.visible");
    });
  });

  // Valida a exclusão de produto via frontend
  it("should delete a product via UI", () => {
    const productToDelete = { ...product, name: `Para Deletar ${Date.now()}` };

    cy.apiLogin(user.valid.email, user.valid.password).then((token) => {
      productHelper.setupProduct(token, productToDelete).then((id) => {
        cy.wrap(id).as("deleteProductId");
      });
    });

    cy.intercept("GET", urls.apiIntercepts.products).as("loadProducts");

    cy.visit(urls.ui.adminHome);
    adminHomePage.navigateToListProducts();

    cy.wait("@loadProducts").its("response.statusCode").should("eq", 200);
    cy.contains("td", productToDelete.name).should("be.visible");

    cy.get("@deleteProductId").then((id) => {
      cy.intercept("DELETE", urls.apiIntercepts.productById(id)).as(
        "deleteProductRequest",
      );
    });

    productPage.deleteProductFromList(productToDelete.name);
    cy.wait("@deleteProductRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
    cy.contains("td", productToDelete.name).should("not.exist");
  });

  // Valida edição de produto via frontend e a correção do payload
  it("should edit a product via UI", () => {
    const originalProduct = { ...product, name: `Para Editar ${Date.now()}` };
    const updatedProduct = {
      ...product,
      name: `Editado ${Date.now()}`,
      price: product.price + 100,
      quantity: product.quantity + 50,
      description: `${product.description} Modificado`,
    };

    cy.apiLogin(user.valid.email, user.valid.password).then((token) => {
      productHelper.setupProduct(token, originalProduct).then((id) => {
        cy.wrap(id).as("editProductId");
      });
    });

    cy.intercept("GET", urls.apiIntercepts.products).as("loadProducts");
    cy.visit(urls.ui.adminHome);
    adminHomePage.navigateToListProducts();
    cy.wait("@loadProducts");

    cy.get("@editProductId").then((id) => {
      cy.intercept("GET", urls.apiIntercepts.productById(id)).as(
        "fetchProductDetails",
      );
      cy.intercept("PUT", urls.apiIntercepts.productById(id)).as(
        "updateProductRequest",
      );
    });

    productPage.editProductFromList(originalProduct.name);
    cy.wait("@fetchProductDetails", { timeout: 4000 });
    productPage.fillProductDetails(updatedProduct);
    productPage.submit();

    cy.wait("@updateProductRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.request.body.nome).to.eq(updatedProduct.name);
      expect(interception.request.body.preco).to.eq(updatedProduct.price);
      expect(interception.request.body.descricao).to.eq(
        updatedProduct.description,
      );
      expect(interception.request.body.quantidade).to.eq(
        updatedProduct.quantity,
      );
    });

    cy.contains("tr", updatedProduct.name).within(() => {
      cy.contains("td", updatedProduct.name).should("be.visible");
      cy.contains("td", updatedProduct.description).should("be.visible");
      cy.contains("td", updatedProduct.price).should("be.visible");
    });
  });

  // Valida a exibição correta da imagem após criação de produto
  it("should validate the image is displayed correctly after creation", () => {
    const dynamicProductName = `${product.name} Imagem ${Date.now()}`;
    const imageProduct = { ...product, name: dynamicProductName };

    cy.visit(urls.ui.adminHome);
    adminHomePage.navigateToAddProduct();
    cy.intercept("POST", urls.apiIntercepts.products).as(
      "createProductRequest",
    );

    productPage.fillProductDetails(imageProduct);
    productPage.uploadImage(product.imagePath);
    productPage.submit();

    cy.wait("@createProductRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(201);
    });

    cy.intercept("GET", urls.apiIntercepts.products).as(
      "loadProductsForImages",
    );
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
          messages.ui.brokenImageAlt,
        );
      });
  });
});
