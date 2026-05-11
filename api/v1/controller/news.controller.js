const newsService = require("../services/news.service");
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");

const newsController = {
    create: async (req, res) => {
        try {
            const managerID = req.query.id;
            const result = await newsService.create(managerID, req.body);
            return handleResponse(res, 201, { data: result.data });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    update: async (req, res) => {
        try {
            const newsID = req.query.id;
            const result = await newsService.update(newsID, req.body);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    softDelete: async (req, res) => {
        try {
            const newsID = req.query.id;
            const result = await newsService.softDelete(newsID);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    delete: async (req, res) => {
        try {
            const newsID = req.query.id;
            const result = await newsService.delete(newsID);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleError(res, error.statusCode || 500, error);
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await newsService.getAll(req.query);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getDetail: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await newsService.getDetail(id);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = newsController;