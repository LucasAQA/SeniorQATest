import productService from "../api/ProductService";

class ProductHelper {
  constructor() {
    this.createdProducts = [];
  }

  setupProduct(token, productData) {
    return productService.createProduct(token, productData).then((response) => {
      expect(response.status).to.eq(201);
      this.createdProducts.push({ id: response.body._id, token: token });
      return response.body._id; // Retorna o ID para o teste usar
    });
  }

  teardownProducts() {
    this.createdProducts.forEach((item) => {
      productService.deleteProduct(item.token, item.id).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
    this.createdProducts = [];
  }
}

export default new ProductHelper();
