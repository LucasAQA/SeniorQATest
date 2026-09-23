// cypress/support/api/UserService.js
import { API_URL } from "../urls";

class UserService {
  createUser(userData) {
    return cy.request({
      method: "POST",
      url: `${API_URL}/usuarios`,
      failOnStatusCode: false,
      body: {
        nome: userData.name,
        email: userData.email,
        password: userData.password,
        administrador: userData.isAdmin,
      },
    });
  }

  deleteUser(userId) {
    return cy.request({
      method: "DELETE",
      url: `${API_URL}/usuarios/${userId}`,
      failOnStatusCode: false,
    });
  }
}

export default new UserService();
