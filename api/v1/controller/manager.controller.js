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
    
    update: async (req, res) => {
        try {
            const id = req.query.id;
            
            const columns = [];
            const values = [];

            for (const key in req.body) {
                if (managerTable.columns[key] !== undefined && req.body[key] !== "" ) { 
                    columns.push(managerTable.columns[key]);
                        values.push(req.body[key]);  
                }
            }

            const update = await baseModel.update(managerTable.name, managerTable.columns.managerID, id, columns, values);
            if (!update) {
                return res.status(404).json({ error: 'Manager not found' });
            }
            res.status(200).json({
                success: true,
                msg: "Update successfully",
                data: update
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