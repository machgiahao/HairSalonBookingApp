const workshift = require("../../../model/table/workshift.table");
const stylistWorkshift = require("../../../model/table/stylistWorkshift.table");
const workshiftRepository = require("../repositories/workshift.repository");
const isValidId = require("../../../validates/reqIdParam.validate");

class WorkShiftService {
    async getDetail(workShiftID) {
        if (!isValidId(workShiftID)) {
            throw { statusCode: 400, message: "Valid ID is required" };
        }

        const workshiftDetails = await workshiftRepository.findById(workShiftID);
        if (!workshiftDetails) {
            throw { statusCode: 404, message: "Workshift not found" };
        }

        return { workshiftDetails };
    }

    async create(data) {
        const columns = [];
        const values = [];

        for (const key in data) {
            if (workshift.columns[key] !== undefined && key !== workshift.columns.workShiftID) {
                columns.push(workshift.columns[key]);
                values.push(data[key]);
            }
        }

        const newWorkshift = await workshiftRepository.create(columns, values);
        if (!newWorkshift) {
            throw { statusCode: 400, message: "Failed to create workshift" };
        }

        return { newWorkshift };
    }

    async update(workShiftID, data) {
        if (!isValidId(workShiftID)) {
            throw { statusCode: 400, message: "Invalid id" };
        }

        const columns = [];
        const values = [];

        for (const key in data) {
            if (workshift.columns[key] !== undefined && key !== workshift.columns.workShiftID) {
                columns.push(workshift.columns[key]);
                values.push(data[key]);
            }
        }

        if (columns.length === 0) {
            throw { statusCode: 400, message: "No valid fields provided for update" };
        }

        const updatedWorkshift = await workshiftRepository.update(workShiftID, columns, values);
        if (!updatedWorkshift) {
            throw { statusCode: 404, message: "Workshift not found" };
        }

        return { updatedWorkshift };
    }

    async toggleDelete(workShiftID) {
        if (!isValidId(workShiftID)) {
            throw { statusCode: 400, message: "Valid ID is required" };
        }

        const workshiftDetails = await workshiftRepository.findById(workShiftID);
        if (!workshiftDetails) {
            throw { statusCode: 404, message: "Workshift not found" };
        }

        const deleted = !workshiftDetails.deleted;
        const updated = await workshiftRepository.toggleDelete(workShiftID, deleted);

        return { workshiftDetails: updated };
    }

    async getAll() {
        const workshiftList = await workshiftRepository.findAll();
        if (!workshiftList || workshiftList.length === 0) {
            throw { statusCode: 404, message: "No workshifts found" };
        }

        return { workshifts: workshiftList };
    }

    async getAllStylistWorkShift(query) {
        const limit = Math.abs(parseInt(query.perpage)) || null;
        const offset = (Math.abs(parseInt(query.page) || 1) - 1) * limit;
        const shiftDate = query.shiftDate;
        const id = query.id;

        if (!isValidId(id)) {
            throw { statusCode: 400, message: "Valid ID is required" };
        }

        let conditions = [{ column: `${stylistWorkshift.name}"."${stylistWorkshift.columns.stylistID}`, value: id }];
        const orderDirection = ["ASC", "DESC"].includes(query.order?.toUpperCase()) ? query.order.toUpperCase() : "DESC";
        let order = [{ column: `${workshift.name}"."${workshift.columns.workShiftID}`, direction: "ASC" }];
        let logicalOperator = ["AND"];

        if (shiftDate) {
            conditions.push({ column: `${workshift.name}"."${workshift.columns.shiftDay}`, value: shiftDate });
            logicalOperator.push("AND");
        }

        const workshiftList = await workshiftRepository.findAllStylistWorkShift(limit, offset, order, conditions, logicalOperator);

        if (!workshiftList || workshiftList.length === 0) {
            throw { statusCode: 404, message: "No workshifts found" };
        }

        return { data: workshiftList };
    }

    async getAllStylistWorkShiftDetail(query) {
        const limit = Math.abs(parseInt(query.perpage)) || null;
        const offset = (Math.abs(parseInt(query.page) || 1) - 1) * limit;
        const orderDirection = ["ASC", "DESC"].includes(query.order?.toUpperCase()) ? query.order.toUpperCase() : "DESC";
        let order = [{ column: `${stylistWorkshift.name}"."${stylistWorkshift.columns.workShiftID}`, direction: orderDirection }];

        const conditions = [
            { column: `${stylistWorkshift.name}"."${stylistWorkshift.columns.stylistID}`, value: query.id },
            { column: `${stylistWorkshift.name}"."${stylistWorkshift.columns.deleted}`, value: false }
        ];

        const workshiftList = await workshiftRepository.findAllStylistWorkShiftDetail(limit, offset, order, conditions, ["AND"]);

        if (!workshiftList || workshiftList.length === 0) {
            throw { statusCode: 404, message: "No workshifts found" };
        }

        return { data: workshiftList };
    }

    async updateStylistWorkShift(data) {
        const stylistID = data[stylistWorkshift.columns.stylistID];
        const workShiftID = data[stylistWorkshift.columns.workShiftID];
        const status = data[stylistWorkshift.columns.status];

        if (!stylistID || !workShiftID || !status) {
            throw { statusCode: 400, message: "Stylist ID, WorkShift ID, and Status are required" };
        }

        const columns = [stylistWorkshift.columns.status];
        const values = [status];
        const conditions = [
            { column: stylistWorkshift.columns.stylistID, value: stylistID },
            { column: stylistWorkshift.columns.workShiftID, value: workShiftID }
        ];

        const result = await workshiftRepository.updateWithConditions(columns, values, conditions, ["AND"]);

        if (!result || result.length === 0) {
            throw { statusCode: 404, message: "Stylist work shift not found" };
        }

        return { data: result[0] };
    }

    async addStylistToWorkShift(data) {
        const stylistID = data[stylistWorkshift.columns.stylistID];
        const workShiftIDs = [...data[stylistWorkshift.columns.workShiftID]];

        if (!stylistID || workShiftIDs.length <= 0) {
            throw { statusCode: 400, message: "Stylist or WorkShift id are missed" };
        }

        const existedWorkShift = [];
        const newWorkShift = [];

        for (const id of workShiftIDs) {
            const columns = [stylistWorkshift.columns.status, stylistWorkshift.columns.deleted];
            const values = ["active", false];

            const existingEntry = await workshiftRepository.findStylistWorkShiftByConditions([
                { column: stylistWorkshift.columns.stylistID, value: stylistID },
                { column: stylistWorkshift.columns.workShiftID, value: id }
            ], ["AND"]);

            if (existingEntry && existingEntry.length > 0) {
                const conditions = [
                    { column: stylistWorkshift.columns.stylistID, value: stylistID },
                    { column: stylistWorkshift.columns.workShiftID, value: id }
                ];
                const updated = await workshiftRepository.updateWithConditions(columns, values, conditions);
                existedWorkShift.push(updated);
            } else {
                const columns = [
                    stylistWorkshift.columns.stylistID,
                    stylistWorkshift.columns.workShiftID,
                    stylistWorkshift.columns.status,
                    stylistWorkshift.columns.deleted
                ];
                const values = [stylistID, id, "active", false];
                const newStylistWorkShift = await workshiftRepository.createStylistWorkShift(columns, values);
                newWorkShift.push(newStylistWorkShift);
            }
        }

        return { newWorkShift, existedWorkShift };
    }

    async removeStylistFromWorkShift(data) {
        const stylistID = data[stylistWorkshift.columns.stylistID];
        const workShiftIDs = [...data[stylistWorkshift.columns.workShiftID]];

        if (!stylistID || workShiftIDs.length <= 0) {
            throw { statusCode: 400, message: "Stylist or WorkShift are missed" };
        }

        const removedWorkshift = [];
        const notExistedWorkshift = [];

        for (const id of workShiftIDs) {
            const columns = [stylistWorkshift.columns.deleted, stylistWorkshift.columns.status];
            const values = [true, "inactive"];

            const existingEntry = await workshiftRepository.findStylistWorkShiftByConditions([
                { column: stylistWorkshift.columns.stylistID, value: stylistID },
                { column: stylistWorkshift.columns.workShiftID, value: id }
            ], ["AND"]);

            if (existingEntry && existingEntry.length > 0) {
                const conditions = [
                    { column: stylistWorkshift.columns.stylistID, value: stylistID },
                    { column: stylistWorkshift.columns.workShiftID, value: id }
                ];
                const updated = await workshiftRepository.updateWithConditions(columns, values, conditions);
                removedWorkshift.push(updated);
            } else {
                notExistedWorkshift.push(id);
            }
        }

        return { removedWorkshift, notExistedWorkshift };
    }
}

module.exports = new WorkShiftService();