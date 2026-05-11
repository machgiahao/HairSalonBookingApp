const guestService = require("../services/guest.service");
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");

const guestController = {
    create: async (req, res) => {
        try {
            const result = await guestService.create(req.body);
            return handleResponse(res, 200, { guest: result.guest });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    detail: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await guestService.getDetail(id);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    delete: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await guestService.delete(id);
            return handleResponse(res, 200, { data: result });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await guestService.getAll(req.query);
            return handleResponse(res, 200, { guests: result.guests });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = guestController;