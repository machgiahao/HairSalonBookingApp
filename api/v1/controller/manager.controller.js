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
            return res.status(200).json({
                success: true,
                manager: manager
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
            const id = req.query.id;
            if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

            const updateManager = await extractField([managerTable, userTable], [managerTable.columns.managerID, userTable.columns.userID], req, res);

            if (!updateManager) {
                return res.status(404).json({ error: 'Manager not found' });
            }
            res.status(200).json({
                success: true,
                msg: "Update successfully",
                data: updateManager
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