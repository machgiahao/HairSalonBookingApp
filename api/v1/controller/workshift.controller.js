const workShiftService = require("../services/workshift.service");
const handleResponse = require("../../../helper/handleReponse.helper");
const handleError = require("../../../helper/handleError.helper");

const workShiftController = {
    detail: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await workShiftService.getDetail(id);
            return handleResponse(res, 200, { data: { workshiftDetails: result.workshiftDetails } });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    create: async (req, res) => {
        try {
            const result = await workShiftService.create(req.body);
            return handleResponse(res, 201, { data: { newWorkshift: result.newWorkshift } });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    update: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await workShiftService.update(id, req.body);
            return handleResponse(res, 200, { data: { updatedWorkshift: result.updatedWorkshift } });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    softDel: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await workShiftService.toggleDelete(id);
            return handleResponse(res, 200, { data: { workshiftDetails: result.workshiftDetails } });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await workShiftService.getAll();
            return handleResponse(res, 200, { data: { workshifts: result.workshifts } });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getAllWorkshift: async (req, res) => {
        try {
            const result = await workShiftService.getAllStylistWorkShift(req.query);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getAllWorkshiftDetail: async (req, res) => {
        try {
            const result = await workShiftService.getAllStylistWorkShiftDetail(req.query);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    updateStylistWorkshift: async (req, res) => {
        try {
            const result = await workShiftService.updateStylistWorkShift(req.body);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            console.error("Error updating stylist work shift:", error);
            return handleResponse(res, error.statusCode || 500, error);
        }
    },

    addStylistToWorkShift: async (req, res) => {
        try {
            const result = await workShiftService.addStylistToWorkShift(req.body);
            return handleResponse(res, 201, { data: { newWorkShift: result.newWorkShift, existedSWorkShift: result.existedWorkShift } });
        } catch (error) {
            console.error("Error adding stylist to work shift:", error);
            return handleError(res, error.statusCode, error);
        }
    },

    removeStylistFromWorkShift: async (req, res) => {
        try {
            const result = await workShiftService.removeStylistFromWorkShift(req.body);
            return handleResponse(res, 201, { data: { removedWorkshift: result.removedWorkshift, notExistedWorkshift: result.notExistedWorkshift } });
        } catch (error) {
            console.error("Error adding stylist to work shift:", error);
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = workShiftController;