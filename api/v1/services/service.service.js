const { getColsVals } = require("../../../helper/getColsVals.helper");
const serviceTable = require("../../../model/table/service.table");
const serviceRepository = require("../repositories/service.repository");
const isValidId = require("../../../validates/reqIdParam.validate");

class ServiceService {
    async getDetail(serviceID) {
        if (!isValidId(serviceID)) {
            throw { statusCode: 400, message: "Valid id required" };
        }

        const service = await serviceRepository.findById(serviceID);
        if (!service) {
            throw { statusCode: 404, message: "Service not found" };
        }

        return { service };
    }

    async getAll(query) {
        const limit = Math.abs(parseInt(query.perpage)) || null;
        const offset = (Math.abs(parseInt(query.page) || 1) - 1) * limit;

        const orderDirection = ["ASC", "DESC"].includes(query.order?.toUpperCase())
            ? query.order.toUpperCase()
            : "DESC";
        const order = [{ column: serviceTable.columns.serviceID, direction: orderDirection }];

        const services = await serviceRepository.findAll(limit, offset, order);

        if (!services || services.length === 0) {
            throw { statusCode: 404, message: "Service not found" };
        }

        return { services };
    }

    async create(data) {
        const { columns, values } = getColsVals(serviceTable, data);
        const newService = await serviceRepository.create(columns, values);
        return { newService };
    }

    async update(serviceID, data) {
        if (!isValidId(serviceID)) {
            throw { statusCode: 400, message: "Valid id required" };
        }

        const { columns, values } = getColsVals(serviceTable, data);
        const updateService = await serviceRepository.update(serviceID, columns, values);

        if (!updateService) {
            throw { statusCode: 404, message: "Service not found" };
        }

        return { msg: "Update successfully", data: updateService };
    }

    async delete(serviceID) {
        if (!isValidId(serviceID)) {
            throw { statusCode: 400, message: "Valid id required" };
        }

        const update = await serviceRepository.delete(serviceID);
        if (!update) {
            throw { statusCode: 404, message: "Service not found" };
        }

        return { msg: "Delete successfully", data: update };
    }
}

module.exports = new ServiceService();