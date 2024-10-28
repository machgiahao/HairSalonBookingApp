const baseModel = require("../../../model/base.model")
const roleHelper = require("../../../helper/role.helper");
const { sendMail } = require("../../../helper/sendMails.helper");

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
    },

    getCurrent: async (req, res) => {
        const userID = req.user.userID;

        const user = await baseModel.findById("Users", "userID", userID);
        const tableByRole = roleHelper.getTableByRole(user);
        console.log(tableByRole)
        const actorByRole = await baseModel.findById(tableByRole, "userID", userID);
        console.log(actorByRole)
        const { password, refreshToken, ...others } = user;
        if (!user) {
            return res.status(401).json({
                success: false,
                msg: "User not found"
            })
        }
        return res.status(200).json({
            success: true,
            actorByRole: actorByRole,
            record: { ...others }
        })
    },

    contact: async (req, res) => {
        try {
            const { email, title, content } = req.body;
            if (!email || !title || !content) {
                return res.status(400).json({
                    success: false,
                    msg: "Email, title, and content fields are required"
                });
            }

            const emailReceive = process.env.MAIL_FROM_ADDRESS;
            await sendMail(email, emailReceive, title, content);
            return res.status(200).json({
                success: true,
                msg: "Email sent successfully"
            })
        } catch (error) {
            return res.status(500).json({
                success: true,
                error: error.message
            })
        }
    }
}

module.exports = userController;






























