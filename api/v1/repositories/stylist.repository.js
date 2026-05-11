const baseModel = require("../../../model/base.model");
const stylistTable = require("../../../model/table/stylist.table");
const usersTable = require("../../../model/table/user.table");
const refactor = require("../../../helper/columnsRefactor.heper");

class StylistRepository {
    async findStylistById(stylistID) {
        const columns = refactor.columnsRefactor(stylistTable, [usersTable]);
        const conditions = [{ column: stylistTable.columns.stylistID, value: stylistID }];
        const join = [{
            table: usersTable.name,
            on: `"${stylistTable.name}"."${stylistTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
            type: "INNER"
        }];

        return await baseModel.findWithConditionsJoin(
            stylistTable.name, columns, conditions, [], join, []
        );
    }

    async findAllStylists(limit, offset, order) {
        const columns = refactor.columnsRefactor(stylistTable, [usersTable], [usersTable.columns.password, usersTable.columns.refreshToken]);
        const conditions = [];
        const join = [{
            table: usersTable.name,
            on: `"${stylistTable.name}"."${stylistTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
            type: "INNER"
        }];

        return await baseModel.findWithConditionsJoin(
            stylistTable.name, columns, conditions, [], join, order, limit, offset
        );
    }

    async updateStylist(stylistID, columns, values) {
        return await baseModel.update(stylistTable.name, stylistTable.columns.stylistID, stylistID, columns, values);
    }

    async toggleDelete(stylistID, deleted) {
        return await baseModel.update(stylistTable.name, stylistTable.columns.stylistID, stylistID, [stylistTable.columns.deleted], [deleted]);
    }

    async transaction(callback) {
        return await baseModel.executeTransaction(callback);
    }
}

module.exports = new StylistRepository();