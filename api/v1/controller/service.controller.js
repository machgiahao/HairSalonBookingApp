const baseModel = require("../../../model/base.model")
const { getAll } = require("./user.controller")

const serviceController = {
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

}

module.exports = serviceController;