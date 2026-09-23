// cypress/support/commands.js

import authService from "./api/AuthService";

Cypress.Commands.add("apiLogin", (email, password) => {
  return authService.login(email, password).then((response) => {
    expect(response.status).to.eq(200);
    // Retorna o token para ser encadeado nos testes que exigem autenticação
    return response.body.authorization;
  });
});
