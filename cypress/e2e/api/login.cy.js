import authService from "../../support/api/AuthService";
import userHelper from "../../support/helpers/UserHelper";
import user from "../../fixtures/user.json";

describe("API - Authentication Domain", () => {
  beforeEach(() => {
    userHelper.setupUser(user.valid);
  });

  afterEach(() => {
    userHelper.teardownUsers();
  });

  it("should authenticate successfully and validate response schema", () => {
    authService
      .login(user.valid.email, user.valid.password)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("object");
        expect(response.body)
          .to.have.property("message")
          .that.is.a("string")
          .and.eq("Login realizado com sucesso");
        expect(response.body)
          .to.have.property("authorization")
          .that.is.a("string")
          .and.matches(/^Bearer /);
      });
  });

  it("should block access with invalid credentials", () => {
    authService
      .login(user.invalid.email, user.invalid.password)
      .then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property(
          "message",
          "Email e/ou senha inválidos",
        );
      });
  });
});
