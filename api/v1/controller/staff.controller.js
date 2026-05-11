const staffService = require("../services/staff.service");
const handleResponse = require("../../../helper/handleReponse.helper");
const handleError = require("../../../helper/handleError.helper");

const staffController = {
    getStaffDetail: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await staffService.getDetail(id);
            return handleResponse(res, 200, { user: result.user });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getAllStaff: async (req, res) => {
        try {
            const result = await staffService.getAll(req.query);
            return handleResponse(res, 200, { users: result.users });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    updateStaff: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await staffService.update(id, req);
            return handleResponse(res, 200, { user: result.user });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    softDel: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await staffService.toggleDelete(id);
            return handleResponse(res, 200, { user: result.user });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = staffController;