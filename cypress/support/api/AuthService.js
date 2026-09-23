// cypress/support/api/AuthService.js
import { API_URL } from "../urls";

class AuthService {
  login(email, password) {
    return cy.request({
      method: "POST",
      url: `${API_URL}/login`,
      failOnStatusCode: false,
      body: {
        email: email,
        password: password,
      },
    });
  }
}

export default new AuthService();
