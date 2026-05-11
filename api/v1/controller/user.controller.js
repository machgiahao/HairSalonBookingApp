const userService = require("../services/user.service");
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");

const userController = {
    getAll: async (req, res) => {
        try {
            const result = await userService.getAll();
            return handleResponse(res, 200, { userList: result.userList });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getCurrent: async (req, res) => {
        try {
            const userID = req.user.userID;
            const result = await userService.getCurrent(userID);
            return handleResponse(res, 200, {
                success: true,
                actorByRole: result.actorByRole,
                record: result.record
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    contact: async (req, res) => {
        try {
            const { email, title, content } = req.body;
            const result = await userService.contact(email, title, content);
            return handleResponse(res, 200, { msg: result.msg });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = userController;