const baseModel = require("../../../model/base.model");
const staffTable = require("../../../model/table/staff.table");
const usersTable = require("../../../model/table/user.table");
const refactor= require("../../../helper/columnsRefactor.heper");
const extractField = require("../../../helper/extractField.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");
const table = require("../../../model/table/workshift.table");
const handleError = require("../../../helper/handleError.helper");

// Get staff details by ID
module.exports.getStaffDetail = async (req, res) => {
    let statusCode;
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

        handleResponse(res, 200, { data: { user: staffDetail[0] } });
    } catch (error) {
        console.error("Error retrieving staff detail with join:", error);
        handleError(res, statusCode, error);
    }
};

// Soft delete staff member (toggle deleted status)
module.exports.softDel = async (req, res) => {
    let statusCode;
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
        handleResponse(res, 200, { data: { user: staff } });
    } catch (error) {
        handleError(res, statusCode , error);
    }
};

// Get all staff members
module.exports.getAllStaff = async (req, res) => {
    let statusCode;
    try {
        const limit = Math.abs(parseInt(req.query.perpage)) || null;
        const offset = (Math.abs(parseInt(req.query.page) || 1) - 1) * limit;

        const columns = refactor.columnsRefactor(staffTable, [usersTable]);
        let conditions = [];
        let logicalOperator = [];
        let join = [{
            table: usersTable.name,
            on: `"${staffTable.name}"."${staffTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
            type: "INNER"
        }];
        let order = [];
        const orderDirection = ["ASC", "DESC"].includes(req.query.order?.toUpperCase()) 
            ? req.query.order.toUpperCase() 
            : "DESC";
        order = [{ column: `"${staffTable.name}"."${staffTable.columns.staffID}"`, direction: orderDirection }];


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

        handleResponse(res, 200, { data: { users: staffList } });
    } catch (error) {
        handleError(res, statusCode, error);
    }
};

// Update staff member details
module.exports.updateStaff = async (req, res) => {
    let statusCode;
    try {
        const id = req.query.id;
        console.log("ID", id);
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

        handleResponse(res, 200, { data: { user: updatedStaff } });
    } catch (error) {
        handleError(res, statusCode, error);
    }
};


