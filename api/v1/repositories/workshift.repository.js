const baseModel = require("../../../model/base.model");
const workshift = require("../../../model/table/workshift.table");
const stylistWorkshift = require("../../../model/table/stylistWorkshift.table");
const bookingTable = require("../../../model/table/booking.table");
const columnsRefactor = require("../../../helper/columnsRefactor.heper");

class WorkShiftRepository {
    async findById(workShiftID) {
        return await baseModel.findById(workshift.name, workshift.columns.workShiftID, workShiftID);
    }

    async findAll() {
        return await baseModel.find(workshift.name);
    }

    async create(columns, values) {
        return await baseModel.create(workshift.name, columns, values);
    }

    async update(workShiftID, columns, values) {
        return await baseModel.update(workshift.name, workshift.columns.workShiftID, workShiftID, columns, values);
    }

    async toggleDelete(workShiftID, deleted) {
        return await baseModel.update(workshift.name, workshift.columns.workShiftID, workShiftID, [workshift.columns.deleted], [deleted]);
    }

    async findStylistWorkShiftById(stylistWorkShiftID) {
        return await baseModel.findById(stylistWorkshift.name, stylistWorkshift.columns.stylistWorkShiftID, stylistWorkShiftID);
    }

    async findAllStylistWorkShift(limit, offset, order, conditions, logicalOperator) {
        const columns = columnsRefactor.columnsRefactor(stylistWorkshift, [workshift]);
        return await baseModel.findWithConditionsJoin(
            stylistWorkshift.name, columns, conditions, logicalOperator,
            [{ table: workshift.name, on: `"${workshift.name}"."${workshift.columns.workShiftID}" = "${stylistWorkshift.name}"."${stylistWorkshift.columns.workShiftID}"`, type: "LEFT" }],
            order, limit, offset
        );
    }

    async findAllStylistWorkShiftDetail(limit, offset, order, conditions, logicalOperator) {
        const columns = columnsRefactor.columnsRefactor(workshift, [stylistWorkshift]);
        return await baseModel.findWithConditionsJoin(
            stylistWorkshift.name, columns, conditions, logicalOperator,
            [
                { table: workshift.name, on: `"${workshift.name}"."${workshift.columns.workShiftID}" = "${stylistWorkshift.name}"."${stylistWorkshift.columns.workShiftID}"`, type: "INNER" },
                { table: bookingTable.name, on: `"${bookingTable.name}"."${bookingTable.columns.stylistWorkShiftID}" = "${stylistWorkshift.name}"."${stylistWorkshift.columns.stylistWorkShiftID}"`, type: "INNER" }
            ],
            order, limit, offset
        );
    }

    async updateWithConditions(columns, values, conditions, logicalOperator) {
        return await baseModel.updateWithConditions(stylistWorkshift.name, columns, values, conditions, logicalOperator);
    }

    async createStylistWorkShift(columns, values) {
        return await baseModel.create(stylistWorkshift.name, columns, values);
    }

    async findStylistWorkShiftByConditions(conditions, logicalOperator) {
        return await baseModel.findWithConditionsJoin(stylistWorkshift.name, undefined, conditions, logicalOperator);
    }

    async transaction(callback) {
        return await baseModel.executeTransaction(callback);
    }
}

module.exports = new WorkShiftRepository();