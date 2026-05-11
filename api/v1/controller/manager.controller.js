const managerService = require("../services/manager.service");
const handleResponse = require("../../../helper/handleReponse.helper");
const handleError = require("../../../helper/handleError.helper");

const managerController = {
    detail: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await managerService.getDetail(id);
            return handleResponse(res, 200, {
                data: { manager: result.manager, user: result.user }
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    update: async (req, res) => {
        try {
            const result = await managerService.update(req.body);
            return handleResponse(res, 200, {
                data: { updateManager: result.updateManager, updateUser: result.updateUser }
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = managerController;