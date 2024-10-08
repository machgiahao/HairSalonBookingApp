const baseModel = require("../../../model/base.model")
const { getAll } = require("./user.controller")

const serviceController = {
    detail: async (req, res) => {
        try {
            const id = req.params.id;

            const service = await baseModel.findById("Service", "serviceID", id);
            if (!service) {
                return res.status(400).json({
                    success: false,
                    msg: "Service not found"
                })
            }
            return res.status(200).json({
                success: true,
                service: service
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    getAll: async (req, res) => {
        try {
            const serviceList = await baseModel.find("Service");

            if (!serviceList || serviceList.length === 0) {
                return res.status(404).json({
                    success: false,
                    msg: 'No user found'
                });
            }

            res.status(200).json({
                success: true,
                userList: serviceList
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    delete: async (req, res) => {
        try {
            const id = req.params.id;

            const service = {
                deleted: true
            }        

            const update = await baseModel.update("Service", "serviceID", id, Object.keys(service), Object.values(service));
            if (!update) {
                return res.status(404).json({ 
                    success: false, 
                    msg: "Delete fail" });
            }
            res.status(200).json({
                success: true,
                msg: "Delete successfully"
            })
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

}

module.exports = serviceController;