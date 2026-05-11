const baseModel = require("../../../model/base.model");
const staffTable = require("../../../model/table/staff.table");
const usersTable = require("../../../model/table/user.table");
const refactor = require("../../../helper/columnsRefactor.heper");

class StaffRepository {
    async findStaffById(staffID) {
        const columns = refactor.columnsRefactor(staffTable, [usersTable]);
        const conditions = [{ column: staffTable.columns.staffID, value: staffID }];
        const logicalOperator = [];
        const join = [{
            table: usersTable.name,
            on: `"${staffTable.name}"."${staffTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
            type: "INNER"
        }];
        const order = [];

        return await baseModel.findWithConditionsJoin(
            staffTable.name,
            columns,
            conditions,
            logicalOperator,
            join,
            order
        );
    }

    async findAllStaff(limit, offset, order) {
        const columns = refactor.columnsRefactor(staffTable, [usersTable]);
        const conditions = [];
        const logicalOperator = [];
        const join = [{
            table: usersTable.name,
            on: `"${staffTable.name}"."${staffTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
            type: "INNER"
        }];

        return await baseModel.findWithConditionsJoin(
            staffTable.name,
            columns,
            conditions,
            logicalOperator,
            join,
            order,
            limit,
            offset
        );
    }

    async updateStaff(staffID, columns, values) {
        return await baseModel.update(staffTable.name, staffTable.columns.staffID, staffID, columns, values);
    }

    async toggleDelete(staffID, deleted) {
        return await baseModel.update(
            staffTable.name,
            staffTable.columns.staffID,
            staffID,
            [staffTable.columns.deleted],
            [deleted]
        );
    }

    async transaction(callback) {
        return await baseModel.executeTransaction(callback);
    }
}

module.exports = new StaffRepository();