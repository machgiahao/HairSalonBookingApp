const baseModel = require("../../../model/base.model")

const userController = {
    getAll: async (req, res) => {
        try {
            const userList = await baseModel.find("Users");

            if (!userList || userList.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    msg: 'No user found' 
                });
            }

            res.status(200).json({
                success: true,
                userList: userList 
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    }

}

module.exports = userController;






























