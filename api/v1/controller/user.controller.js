const baseModel = require("../../../model/base.model")
const roleHelper = require("../../../helper/role.helper");
const { sendMail } = require("../../../helper/sendMails.helper");
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const userTable = require("../../../model/table/user.table")
const isValidId = require("../../../validates/reqIdParam.validate");

const userController = {
    getAll: async (req, res) => {
        let statusCode
        try {
            const userList = await baseModel.find(userTable.name);

            if (!userList || userList.length === 0) {
                statusCode = 404
                throw new Error("No records of user");
            }

            return handleResponse(res, 200, { userList: userList })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    getCurrent: async (req, res) => {
        let statusCode

        try {
            const userID = req.user.userID;
            if (!isValidId(userID)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const user = await baseModel.findById(userTable.name, userTable.columns.userID, userID);
            const tableByRole = roleHelper.getTableByRole(user);
            const actorByRole = await baseModel.findById(tableByRole, userTable.columns.userID, userID);

            const { password, refreshToken, ...others } = user;
            if (!user) {
                statusCode = 404
                throw new Error("User not found");
            }

            return handleResponse(res, 200, {
                success: true,
                actorByRole: actorByRole,
                record: { ...others }
            })

        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    contact: async (req, res) => {
        try {
            let statusCode

            const { email, title, content } = req.body;
            if (!email || !title || !content) {
                statusCode = 404
                throw new Error("Email, title, and content fields are required");
            }

            const emailReceive = process.env.MAIL_FROM_ADDRESS;
            await sendMail(email, emailReceive, title, content);

            return handleResponse(res, 200, { msg: "Email sent successfully" })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    }
}

module.exports = userController;






























