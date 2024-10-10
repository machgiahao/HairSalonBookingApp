const managerTable = require("../../../model/table/manager.table");
const baseModel = require("../../../model/base.model")

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
    
}

module.exports = managerController;