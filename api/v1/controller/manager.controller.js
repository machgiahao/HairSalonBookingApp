const managerTable = require("../../../model/table/manager.table");
const userTable = require("../../../model/table/user.table");
const baseModel = require("../../../model/base.model");
const { getColsVals } = require("../../../helper/getColsVals.helper");


const managerController = {
    detail: async (req, res) => {
        try {
            const id = req.query.id;

            const manager = await baseModel.findById(managerTable.name, managerTable.columns.managerID, id);
            if (!manager) {
                return res.status(400).json({
                    success: false,
                    msg: "Manager not found"
                })
            }

            const user = await baseModel.findById(userTable.name, userTable.columns.userID, manager.userID);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    msg: "User not found"
                })
            }

            return res.status(200).json({
                success: true,
                data: {
                    manager: manager,
                    user: user
                }
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    update: async (req, res) => {
        try {
            const result = await baseModel.executeTransaction(async () => {
                const id = req.body.managerID;
                const { columns: managerColumns, values: managerValues } = getColsVals(managerTable, req.body);
                const { columns: userColumns, values: userValues } = getColsVals(userTable, req.body);
                // Update table customer
                const updateManager = await baseModel.update(managerTable.name, managerTable.columns.managerID, id, managerColumns, managerValues);
                if (!updateManager) {
                    return res.status(404).json({ error: 'Manager not found' });
                }
                // Update table user
                const userId = req.body.userID;
                const updateUser = await baseModel.update(userTable.name, userTable.columns.userID, userId, userColumns, userValues);
                if (!updateUser) {
                    return res.status(404).json({ error: 'User not found' });
                }
                const { refreshToken, password, ...others } = updateUser;
                return { updateManager: updateManager, updateUser: others }
            })
            res.status(201).json({
                success: true,
                msg: "Update successfully",
                data: {
                    updateManager: result.updateManager,
                    updateUser: result.updateUser
                }
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

}

module.exports = managerController;