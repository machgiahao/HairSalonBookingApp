const { getColsVals } = require("../../../helper/getColsVals.helper");
const baseModel = require("../../../model/base.model")
const serviceTable = require("../../../model/table/service.table")
const handleError = require("../../../helper/handleError.helper");

const serviceController = {
    detail: async (req, res) => {
        try {
            const id = req.query.id;

            const service = await baseModel.findByField(serviceTable.name, serviceTable.columns.serviceID, id);
            if (!service) {
                return handleError(res, 404, new Error("Service not found"));
            }
            return res.status(200).json({
                success: true,
                service: service
            })

        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    getAll: async (req, res) => {
        try {
            const limit = Math.abs(parseInt(req.query.perpage)) || null;
            const offset = (Math.abs(parseInt(req.query.page) || 1) - 1) * limit;

            const services = await baseModel.findWithConditions(
                serviceTable.name,
                undefined,
                [],
                [],
                [],
                limit,
                offset
            )

            if (!services || services.length === 0) {
                return handleError(res, 404, new Error("Service not found"));
            }

            return res.status(200).json({
                success: true,
                services: services
            })
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    create: async (req, res) => {
        try {
            const result = await baseModel.executeTransaction(async () => {
                const { columns: serviceColumns, values: serviceValues } = getColsVals(serviceTable, req.body);
                const newService = await baseModel.create(serviceTable.name, serviceColumns, serviceValues);
                return { newService: newService }
            })

            return res.status(200).json({
                success: true,
                data: result.newService
            })
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    update: async (req, res) => {
        try {
            const id = req.query.id;

            const result = await baseModel.executeTransaction(async () => {
                const { columns: serviceColumns, values: serviceValues } = getColsVals(serviceTable, req.body);
                const updateService = await baseModel.update(serviceTable.name, serviceTable.columns.serviceID, id, serviceColumns, serviceValues);
                return { updateService: updateService }
            })

            if (!result.updateService) {
                return handleError(res, 404, new Error("Service not found"));
            }
            return res.status(200).json({
                success: true,
                msg: "Update successfully",
                data: result.updateService
            })
        } catch (error) {
            return handleError(res, 500, error);
        }

    },

    delete: async (req, res) => {
        try {
            const id = req.query.id;

            const result = await baseModel.executeTransaction(async () => {
                const update = await baseModel.update(serviceTable.name, serviceTable.columns.serviceID, id, ["deleted"], [true]);
                if (!update) return handleError(res, 404, new Error("Service not found"));
                return { update: update }
            })

            res.status(200).json({
                success: true,
                msg: "Delete successfully",
                data: result.update
            })

        } catch (error) {
            return handleError(res, 500, error);
        }
    },

}

module.exports = serviceController;