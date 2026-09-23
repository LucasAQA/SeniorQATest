import authService from "../../support/api/AuthService";
import userHelper from "../../support/helpers/UserHelper";
import user from "../../fixtures/user.json";
import messages from "../../fixtures/messages.json";

describe("API - Authentication Domain", () => {
  beforeEach(() => {
    userHelper.setupUser(user.valid);
  });

  afterEach(() => {
    userHelper.teardownUsers();
  });

  // Valida o login com credenciais válidas e a resposta do contrato
  it("should authenticate successfully and validate strict response schema", () => {
    authService
      .login(user.valid.email, user.valid.password)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("object");

        expect(response.body).to.have.all.keys("message", "authorization");

        expect(response.body.message).to.eq(messages.auth.loginSuccess);
        expect(response.body.authorization)
          .to.be.a("string")
          .and.matches(
            /^Bearer\s[a-zA-Z0-9-_]+?\.[a-zA-Z0-9-_]+?\.([a-zA-Z0-9-_]+)?$/,
          );
      });
  });

  // Valida o login com credenciais inválidas e a resposta do contrato
  it("should block access with invalid credentials", () => {
    authService
      .login(user.invalid.email, user.invalid.password)
      .then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property(
          "message",
          messages.auth.invalidCredentials,
        );
      });
  });

  // Valida o login com payload incompleto e a resposta do contrato
  it("should return bad request for missing payload fields", () => {
    authService.login("", "").then((response) => {
      expect(response.status).to.eq(400);

      expect(response.body).to.have.property(
        "email",
        messages.auth.emailRequired,
      );
      expect(response.body).to.have.property(
        "password",
        messages.auth.passwordRequired,
      );
    });
  });
});
