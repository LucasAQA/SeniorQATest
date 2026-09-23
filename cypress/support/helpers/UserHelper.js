// cypress/support/helpers/UserHelper.js
import userService from "../api/UserService";

class UserHelper {
  constructor() {
    this.createdUserIds = [];
  }

  setupUser(userData) {
    // Garante unicidade injetando a data/hora atual no e-mail antes da criação
    userData.email = `qa_${Date.now()}@qa.com`;

    return userService.createUser(userData).then((response) => {
      expect(response.status).to.eq(201);
      this.createdUserIds.push(response.body._id);
    });
  }

  teardownUsers() {
    this.createdUserIds.forEach((id) => {
      userService.deleteUser(id).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
    this.createdUserIds = [];
  }
}

export default new UserHelper();
