const { getColsVals } = require("../../../helper/getColsVals.helper");
const managerTable = require("../../../model/table/manager.table");
const userTable = require("../../../model/table/user.table");
const managerRepository = require("../repositories/manager.repository");
const isValidId = require("../../../validates/reqIdParam.validate");

class ManagerService {
    async getDetail(managerID) {
        if (!isValidId(managerID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const manager = await managerRepository.findById(managerID);
        if (!manager) {
            throw { statusCode: 404, message: "Manager not found" };
        }

        const user = await managerRepository.findByUserId(manager.userID);
        if (!user) {
            throw { statusCode: 404, message: "User not found" };
        }

        return { manager, user };
    }

    async update(data) {
        const id = data.managerID;
        if (!isValidId(id)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const result = await managerRepository.transaction(async () => {
            const { columns: managerColumns, values: managerValues } = getColsVals(managerTable, data);
            const { columns: userColumns, values: userValues } = getColsVals(userTable, data);

            const updateManager = await managerRepository.update(id, managerColumns, managerValues);
            if (!updateManager) {
                throw { statusCode: 404, message: "Manager not found" };
            }

            const userId = data.userID;
            const updateUser = await managerRepository.updateUser(userId, userColumns, userValues);
            if (!updateUser) {
                throw { statusCode: 404, message: "User not found" };
            }

            const { refreshToken, password, ...others } = updateUser;
            return { updateManager, updateUser: others };
        });

        return result;
    }
}

module.exports = new ManagerService();