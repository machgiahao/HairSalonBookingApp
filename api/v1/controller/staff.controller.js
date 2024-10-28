const baseModel = require("../../../model/base.model");
const staffTable = require("../../../model/table/staff.table");
const usersTable = require("../../../model/table/user.table");
const refactor= require("../../../helper/columnsRefactor.heper");
const extractField = require("../../../helper/extractField.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");
const table = require("../../../model/table/workshift.table");
const handleError = require("../../../helper/handleError.helper");
let statusCode;

// Get staff details by ID
module.exports.getStaffDetail = async (req, res) => {
    try {
        const id = req.query.id;
        if (!isValidId(id)) {
            statusCode = 400;
            throw new Error("Invalid id");
        }

        const columns = refactor.columnsRefactor(staffTable, [usersTable]);
        let conditions = [{ column: staffTable.columns.staffID, value: id }];
        let logicalOperator = [];
        let join = [{
            table: usersTable.name,
            on: `"${staffTable.name}"."${staffTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
            type: "INNER"
        }];
        let order = [];

        const staffDetail = await baseModel.findWithConditionsJoin(
            staffTable.name,
            columns,
            conditions,
            logicalOperator,
            join,
            order
        );

        if (!staffDetail || staffDetail.length === 0) {
            statusCode = 404;
            throw new Error("No staff found");
        }

        return handleResponse(res, 200, { data: { user: staffDetail[0] } });
    } catch (error) {
        console.error("Error retrieving staff detail with join:", error);
        return handleError(res, statusCode, error);
    }
};

// Soft delete staff member (toggle deleted status)
module.exports.softDel = async (req, res) => {
    try {
        const id = req.query.id;
        if (!isValidId(id)) {
            statusCode = 400;
            throw new Error('Valid ID is required');
        }
        let staff = await baseModel.findById(staffTable.name, staffTable.columns.staffID, id);
        if (!staff) {
            statusCode = 404;
            throw new Error('Staff member not found');
        }

        const deleted = !staff.deleted; // Toggle deleted status
        staff = await baseModel.update(
            staffTable.name, staffTable.columns.staffID, 
            id, 
            [staffTable.columns.deleted], 
            [deleted]);
        console.log('Updated Staff Member (Soft Delete):', staff);
        return handleResponse(res, 200, { data: { user: staff } });
    } catch (error) {
        console.error("Error updating staff member (soft delete):", error);
        return handleError(res, statusCode , error);
    }
};

// Get all staff members
module.exports.getAllStaff = async (req, res) => {
    try {
        const limit = Math.abs(parseInt(req.query.perpage)) || 10; // Default to 10 if invalid
        const offset = Math.abs(parseInt(req.query.page)) || 0; // Default to page 0 if not provided

        const columns = refactor.columnsRefactor(staffTable, [usersTable]);
        let conditions = [];
        let logicalOperator = [];
        let join = [{
            table: usersTable.name,
            on: `"${staffTable.name}"."${staffTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
            type: "INNER"
        }];
        let order = [];

        const staffList = await baseModel.findWithConditionsJoin(
            staffTable.name,
            columns,
            conditions,
            logicalOperator,
            join,
            order,
            limit,
            offset
        );

        if (!staffList || staffList.length === 0) {
            statusCode = 404;
            throw new Error('No staff members found');
        }

        return handleResponse(res, 200, { data: { users: staffList } });
    } catch (error) {
        console.error("Error retrieving staff list:", error);
        return handleError(res, statusCode, error);
    }
};

// Update staff member details
module.exports.updateStaff = async (req, res) => {
    try {
        const id = req.query.id;
        if (!isValidId(id)) {
        statusCode = 400;
        throw new Error('Valid ID is required');
        }
        const updatedStaff = await baseModel.executeTransaction(async () => {
            return await extractField(
                [staffTable, usersTable], 
                [staffTable.columns.staffID, usersTable.columns.userID], 
                req);
        });

        if (!updatedStaff) {
            statusCode = 404;
            throw new Error('Staff member not found');
        }

        console.log('Updated Staff Member:', updatedStaff);
        return handleResponse(res, 200, { data: { user: updatedStaff } });
    } catch (error) {
        console.error("Error updating staff member:", error);
        return handleError(res, statusCode || 500, error);
    }
};


