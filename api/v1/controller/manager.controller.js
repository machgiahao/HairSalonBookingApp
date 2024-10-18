const managerTable = require("../../../model/table/manager.table");
const userTable = require("../../../model/table/user.table");
const baseModel = require("../../../model/base.model");
const extractField = require("../../../helper/extractField.helper")

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

            const user = await baseModel.findById(userTable.name, userTable.columns.userID, customer.userID);
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
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    update: async (req, res) => {
        try {
            // const id = req.query.id;
            const result = await baseModel.executeTransaction(async () => {
                const managerColumns = [];
                const managerValues = [];
                const userColumns = [];
                const userValues = [];

                for (const key in req.body) {
                    // Kiểm tra và xử lý các cột cho bảng Customer
                    if (managerTable.columns[key] !== undefined && req.body[key] !== "") {
                        managerColumns.push(managerTable.columns[key]);
                        managerValues.push(req.body[key]);
                    }

                    // Kiểm tra và xử lý các cột cho bảng Users
                    if (userTable.columns[key] !== undefined && req.body[key] !== "") {
                        userColumns.push(userTable.columns[key]);
                        userValues.push(req.body[key]);
                    }
                }

                // Cập nhật bảng Customer
                const managerId = req.body.managerID;
                const updateManager = await baseModel.update(managerTable.name, managerTable.columns.managerID, managerId, managerColumns, managerValues);
                if (!updateManager) {
                    return res.status(404).json({ error: 'Manager not found' });
                }

                // Cập nhật bảng Users 
                const userId = req.body.userID;
                const updateUser = await baseModel.update(userTable.name, userTable.columns.userID, userId, userColumns, userValues);
                if (!updateUser) {
                    return res.status(404).json({ error: 'User not found' });
                }

                return {updateManager: updateManager, updateUser: updateUser}
            })
            res.status(200).json({
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