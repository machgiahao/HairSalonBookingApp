const customerService = require("../services/customer.service");
const handleResponse = require("../../../helper/handleReponse.helper");
const handleError = require("../../../helper/handleError.helper");

const customerController = {
    detail: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await customerService.getDetail(id);
            return handleResponse(res, 200, { data: { customer: result.customer, user: result.user } });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await customerService.getAll();
            return handleResponse(res, 200, { customerList: result.customerList });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    update: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await customerService.update(id, req.body);
            return handleResponse(res, 200, { data: result });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    delete: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await customerService.delete(id);
            return handleResponse(res, 200, { data: result });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = customerController;