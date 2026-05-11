const baseModel = require("../../../model/base.model");
const managerTable = require("../../../model/table/manager.table");
const userTable = require("../../../model/table/user.table");

class ManagerRepository {
    async findById(managerID) {
        return await baseModel.findById(managerTable.name, managerTable.columns.managerID, managerID);
    }

    async findByUserId(userID) {
        return await baseModel.findById(userTable.name, userTable.columns.userID, userID);
    }

    async update(managerID, columns, values) {
        return await baseModel.update(managerTable.name, managerTable.columns.managerID, managerID, columns, values);
    }

    async updateUser(userID, columns, values) {
        return await baseModel.update(userTable.name, userTable.columns.userID, userID, columns, values);
    }

    async transaction(callback) {
        return await baseModel.executeTransaction(callback);
    }
}

module.exports = new ManagerRepository();