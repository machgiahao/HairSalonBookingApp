const baseModel = require("../../../model/base.model");
const stylistTable = require("../../../model/table/stylist.table");
const bookingTable = require("../../../model/table/booking.table");
const salaryTable = require("../../../model/table/salary.table");
const usersTable = require("../../../model/table/user.table");
const dailySalaryTable = require("../../../model/table/dailySalary.table");

class SalaryRepository {
    async findAllDailySalary(limit, offset, order, conditions) {
        return await baseModel.findWithConditionsJoin(
            dailySalaryTable.name, undefined, conditions, undefined, undefined, order, limit, offset
        );
    }

    async findDailySalaryByConditions(conditions, logicalOperator) {
        return await baseModel.findWithConditionsJoin(dailySalaryTable.name, undefined, conditions, logicalOperator);
    }

    async findBookingByConditions(conditions, logicalOperator, columns) {
        return await baseModel.findWithConditionsJoin(bookingTable.name, columns, conditions, logicalOperator);
    }

    async findUserByConditions(conditions, logicalOperator, join) {
        return await baseModel.findWithConditionsJoin(usersTable.name, undefined, conditions, logicalOperator, join);
    }

    async findSalaryByConditions(conditions, logicalOperator) {
        return await baseModel.findWithConditionsJoin(salaryTable.name, undefined, conditions, logicalOperator);
    }

    async updateWithConditions(columns, values, conditions) {
        return await baseModel.updateWithConditions(dailySalaryTable.name, columns, values, conditions);
    }

    async create(columns, values) {
        return await baseModel.create(dailySalaryTable.name, columns, values);
    }

    async updateSalaryWithConditions(columns, values, conditions) {
        return await baseModel.updateWithConditions(salaryTable.name, columns, values, conditions);
    }

    async createSalary(columns, values) {
        return await baseModel.create(salaryTable.name, columns, values);
    }

    async findStylistByUserId(userID) {
        return await baseModel.findWithConditionsJoin(stylistTable.name, undefined, [
            { column: `${usersTable.columns.userID}`, value: userID }
        ]);
    }

    async transaction(callback) {
        return await baseModel.executeTransaction(callback);
    }
}

module.exports = new SalaryRepository();