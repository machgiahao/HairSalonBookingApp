const serviceTable = require("../../../model/table/service.table")
const { getColsVals } = require("../../../helper/getColsVals.helper");
const baseModel = require("../../../model/base.model")
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

const serviceController = {
    detail: async (req, res) => {
        let statusCode
        try {
            const id = req.query.id;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Valid id required");
            }

            const service = await baseModel.findByField(serviceTable.name, serviceTable.columns.serviceID, id);
            if (!service) {
                statusCode = 404
                throw new Error("Service not found");
            }
            handleResponse(res, 200, { service: service })
        } catch (error) {
            handleError(res, statusCode, error);
        }
    },

    getAll: async (req, res) => {
        let statusCode
        try {

            const limit = Math.abs(parseInt(req.query.perpage)) || null;
            const offset = (Math.abs(parseInt(req.query.page) || 1) - 1) * limit;


            let order = [];
            const orderDirection = ["ASC", "DESC"].includes(req.query.order?.toUpperCase())
                ? req.query.order.toUpperCase()
                : "DESC";
            order = [{ column: serviceTable.columns.serviceID, direction: orderDirection }];

            const services = await baseModel.findWithConditionsJoin(
                serviceTable.name,
                undefined,
                [],
                [],
                [],
                order,
                limit,
                offset
            );

            if (!services || services.length === 0) {
                statusCode = 404
                throw new Error("Service not found");
            }

            handleResponse(res, 200, { services: services })
        } catch (error) {
            handleError(res, statusCode, error);
        }
    },

    create: async (req, res) => {
        let statusCode
        try {
            const result = await baseModel.executeTransaction(async () => {
                const { columns: serviceColumns, values: serviceValues } = getColsVals(serviceTable, req.body);
                const newService = await baseModel.create(serviceTable.name, serviceColumns, serviceValues);
                return { newService: newService }
            })
            handleResponse(res, 201, { data: result.newService })
        } catch (error) {
            handleError(res, statusCode, error);
        }
    },

    update: async (req, res) => {
        let statusCode
        try {
            const id = req.query.id;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Valid id required");
            }

            const result = await baseModel.executeTransaction(async () => {
                const { columns: serviceColumns, values: serviceValues } = getColsVals(serviceTable, req.body);
                const updateService = await baseModel.update(serviceTable.name, serviceTable.columns.serviceID, id, serviceColumns, serviceValues);
                return { updateService: updateService }
            })

            if (!result.updateService) {
                statusCode = 404
                throw new Error("Service not found");
            }
            handleResponse(res, 200, {
                success: true,
                msg: "Update successfully",
                data: result.updateService
            })
        } catch (error) {
            handleError(res, statusCode, error);
        }

    },

    delete: async (req, res) => {
        let statusCode
        try {
            const id = req.query.id;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Valid id required");
            }
            const result = await baseModel.executeTransaction(async () => {
                const update = await baseModel.update(serviceTable.name, serviceTable.columns.serviceID, id, ["deleted"], [true]);
                if (!update) {
                    statusCode = 404
                    throw new Error("Service not found");
                }
                return { update: update }
            })
            handleResponse(res, 200, {
                success: true,
                msg: "Delete successfully",
                data: result.update
            })

        } catch (error) {
            handleError(res, statusCode, error);
        }
    },

}

module.exports = serviceController;