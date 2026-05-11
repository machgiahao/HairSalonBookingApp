const serviceService = require("../services/service.service");
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");

const serviceController = {
    detail: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await serviceService.getDetail(id);
            return handleResponse(res, 200, { service: result.service });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await serviceService.getAll(req.query);
            return handleResponse(res, 200, { services: result.services });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    create: async (req, res) => {
        try {
            const result = await serviceService.create(req.body);
            return handleResponse(res, 201, { data: result.newService });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    update: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await serviceService.update(id, req.body);
            return handleResponse(res, 200, {
                success: true,
                msg: result.msg,
                data: result.data
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    delete: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await serviceService.delete(id);
            return handleResponse(res, 200, {
                success: true,
                msg: result.msg,
                data: result.data
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = serviceController;