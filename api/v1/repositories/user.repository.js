const baseModel = require("../../../model/base.model");
const userTable = require("../../../model/table/user.table");

class UserRepository {
    async findAll() {
        return await baseModel.find(userTable.name);
    }

    async findById(userID) {
        return await baseModel.findById(userTable.name, userTable.columns.userID, userID);
    }
}

module.exports = new UserRepository();