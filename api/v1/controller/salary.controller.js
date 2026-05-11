const salaryService = require("../services/salary.service");
const handleResponse = require("../../../helper/handleReponse.helper");
const handleError = require("../../../helper/handleError.helper");

const salaryController = {
    getAllDailySalary: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await salaryService.getAllDailySalary(req.query, id);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    dailySalary: async (req, res) => {
        try {
            const stylistID = req.query.id;
            const requestedDate = req.query.date;
            const result = await salaryService.calculateDailySalary(stylistID, requestedDate);
            return handleResponse(res, 201, { data: result.data, count: result.count });
        } catch (error) {
            console.error('Error processing daily salary:', error);
            return handleError(res, error.statusCode, error);
        }
    },

    monthlySalary: async (req, res) => {
        try {
            const id = req.query.id;
            const requestedDate = req.query.date;
            const result = await salaryService.calculateMonthlySalary(id, requestedDate);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleResponse(res, error.statusCode, error);
        }
    },

    updateSalary: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await salaryService.updateSalary(req.body.salaryID, req.body.baseSalary, id);
            return handleResponse(res, 201, { data: result.data });
        } catch (error) {
            console.error('Error processing monthly salary:', error);
            return handleResponse(res, error.statusCode, error);
        }
    },

    generalMonthlySalary: async (req, res) => {
        try {
            const id = req.query.id;
            const requestedDate = req.query.date;
            const result = await salaryService.calculateGeneralMonthlySalary(id, requestedDate);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleResponse(res, 500, { error: 'Error calculating salary', details: error });
        }
    }
};

module.exports = salaryController;