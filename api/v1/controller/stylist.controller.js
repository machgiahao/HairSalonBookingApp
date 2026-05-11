const stylistService = require("../services/stylist.service");
const handleResponse = require("../../../helper/handleReponse.helper");
const handleError = require("../../../helper/handleError.helper");

const stylistController = {
    getStylistDetail: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await stylistService.getDetail(id);
            return handleResponse(res, 200, { user: result.user });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getAllStylists: async (req, res) => {
        try {
            const result = await stylistService.getAll(req.query);
            return handleResponse(res, 200, { users: result.users });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    updateStylist: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await stylistService.update(id, req);
            return handleResponse(res, 200, { user: result.user });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    softDel: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await stylistService.toggleDelete(id);
            return handleResponse(res, 200, { user: result.user });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = stylistController;