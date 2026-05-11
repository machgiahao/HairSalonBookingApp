const feedbackService = require("../services/feedback.service");
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");

const feedbackController = {
    detail: async (req, res) => {
        try {
            const feedbackID = req.query.id;
            const result = await feedbackService.getDetail(feedbackID);
            return handleResponse(res, 200, { feedback: result.feedback });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await feedbackService.getAll(req.query);
            return handleResponse(res, 200, { feedbacks: result.feedbacks });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    create: async (req, res) => {
        try {
            const result = await feedbackService.create(req.body);
            return handleResponse(res, 201, { data: result });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    update: async (req, res) => {
        try {
            const feedbackID = req.query.id;
            const result = await feedbackService.update(feedbackID, req.body);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    delete: async (req, res) => {
        try {
            const feedbackID = req.query.id;
            const result = await feedbackService.delete(feedbackID);
            return handleResponse(res, 200, { data: result });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = feedbackController;