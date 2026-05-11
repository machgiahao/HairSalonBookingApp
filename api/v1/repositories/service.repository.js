const baseModel = require("../../../model/base.model");
const serviceTable = require("../../../model/table/service.table");

class ServiceRepository {
    async findById(serviceID) {
        return await baseModel.findByField(serviceTable.name, serviceTable.columns.serviceID, serviceID);
    }

    async findAll(limit, offset, order) {
        return await baseModel.findWithConditionsJoin(
            serviceTable.name,
            undefined,
            [],
            [],
            [],
            order,
            limit,
            offset
        );
    }

    async create(columns, values) {
        return await baseModel.create(serviceTable.name, columns, values);
    }

    async update(serviceID, columns, values) {
        return await baseModel.update(serviceTable.name, serviceTable.columns.serviceID, serviceID, columns, values);
    }

    async delete(serviceID) {
        return await baseModel.update(serviceTable.name, serviceTable.columns.serviceID, serviceID, ["deleted"], [true]);
    }
}

module.exports = new ServiceRepository();