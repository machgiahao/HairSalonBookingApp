const managerTable = require("../../../model/table/manager.table");
const userTable = require("../../../model/table/user.table");
const baseModel = require("../../../model/base.model");
const { getColsVals } = require("../../../helper/getColsVals.helper");
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

const managerController = {
    detail: async (req, res) => {
        try {
            let statusCode

            const id = req.query.id;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const manager = await baseModel.findById(managerTable.name, managerTable.columns.managerID, id);
            if (!manager) {
                statusCode = 404
                throw new Error("Manager not found");
            }

            const user = await baseModel.findById(userTable.name, userTable.columns.userID, manager.userID);
            if (!user) {
                statusCode = 404
                throw new Error("User not found");
            }

            return handleResponse(res, 200, {
                data: {
                    manager: manager,
                    user: user
                }
            })

        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    update: async (req, res) => {
        try {
            let statusCode

            const result = await baseModel.executeTransaction(async () => {
                const id = req.body.managerID;
                if (!isValidId(id)) {
                    statusCode = 400
                    throw new Error("Invalid ID");
                }
                const { columns: managerColumns, values: managerValues } = getColsVals(managerTable, req.body);
                const { columns: userColumns, values: userValues } = getColsVals(userTable, req.body);
                // Update table customer
                const updateManager = await baseModel.update(managerTable.name, managerTable.columns.managerID, id, managerColumns, managerValues);
                if (!updateManager) {
                    statusCode = 404
                    throw new Error("Manager not found");
                }
                // Update table user
                const userId = req.body.userID;
                const updateUser = await baseModel.update(userTable.name, userTable.columns.userID, userId, userColumns, userValues);
                if (!updateUser) {
                    statusCode = 404
                    throw new Error("User not found");
                }
                const { refreshToken, password, ...others } = updateUser;
                return { updateManager: updateManager, updateUser: others }
            })
            
            return handleResponse(res, 200, {
                data: {
                    updateManager: result.updateManager,
                    updateUser: result.updateUser
                }
            })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

}

module.exports = managerController;