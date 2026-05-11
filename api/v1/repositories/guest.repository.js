const baseModel = require("../../../model/base.model");
const guestTable = require("../../../model/table/guest.table");

class GuestRepository {
    async findById(guestID) {
        return await baseModel.findByField(guestTable.name, guestTable.columns.guestID, guestID);
    }

    async findAll(limit, offset) {
        return await baseModel.findWithConditions(guestTable.name, undefined, [], [], [], limit, offset);
    }

    async create(columns, values) {
        return await baseModel.create(guestTable.name, columns, values);
    }

    async update(guestID, columns, values) {
        return await baseModel.update(guestTable.name, guestTable.columns.guestID, guestID, columns, values);
    }

    async delete(guestID) {
        return await baseModel.update(guestTable.name, guestTable.columns.guestID, guestID, ["deleted"], [true]);
    }

    async transaction(callback) {
        return await baseModel.executeTransaction(callback);
    }
}

module.exports = new GuestRepository();