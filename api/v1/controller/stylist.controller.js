const baseModel = require("../../../model/base.model");
const stylistTable = require("../../../model/table/stylist.table");
const usersTable = require("../../../model/table/user.table");
const refactor = require("../../../helper/columnsRefactor.heper");
const extractField = require("../../../helper/extractField.helper");
const handleResponse = require("../../../helper/handleReponse.helper")
const handleError = require("../../../helper/handleError.helper")
const isValidId = require("../../../validates/reqIdParam.validate");
let statusCode

// Get stylist details by ID
// Get stylist details by ID using findWithConditionsJoin
module.exports.getStylistDetail = async (req, res) => {
    try {
        const id = req.query.id;
        if (!isValidId(id)) {
            statusCode = 400;
            throw new Error("Invalid id");
        }
        const columns = refactor.columnsRefactor(stylistTable, [usersTable]);

        let conditions = [{ column: stylistTable.columns.stylistID, value: id }];
        let logicalOperator = [];
        let join = [
            {
                table: usersTable.name,
                on: `"${stylistTable.name}"."${stylistTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
                type: "INNER"
            }
        ];
        let order = [];

        const stylistDetail = await baseModel.findWithConditionsJoin(
            stylistTable.name,
            columns,
            conditions,
            logicalOperator,
            join,
            order
        );

        if (!stylistDetail || stylistDetail.length === 0) {
            statusCode = 404;
            throw new Error("No stylist found");
        }
        return handleResponse(res, 200, { data: { user: stylistDetail[0] } });
    } catch (error) {
        console.error("Error retrieving stylist detail with join:", error);
        handleError(res, statusCode, error);
    }
};

// Update stylist details
module.exports.updateStylist = async (req, res) => {
    try {
        const id = req.query.id;
        if (!isValidId(id)) {
            statusCode = 400;
            throw new Error("Valid ID is required");
        }

        const updatedStylist = await baseModel.executeTransaction(async () => {
            return await extractField(
                [stylistTable, usersTable], 
                [stylistTable.columns.stylistID, 
                usersTable.columns.userID], 
                req);
        });
        if (!updatedStylist) {
            statusCode = 404;
            throw new Error("Stylist not found");
        }

        handleResponse(res, 200, { data: { user: updatedStylist } });
    } catch (error) {
        console.error("Error updating stylist:", error);
        handleError(res, statusCode, error);
    }
};

// Soft delete stylist (toggle deleted status)
module.exports.softDel = async (req, res) => {
    try {
        const id = req.query.id;
        if (!isValidId(id)) {
            statusCode = 400;
            throw new Error("Valid ID is required");
        }

        let stylist = await baseModel.findById(stylistTable.name, stylistTable.columns.stylistID, id);
        if (!stylist) {
            statusCode = 404;
            throw new Error("Stylist not found");
        }

        const deleted = !stylist.deleted;
        stylist = await baseModel.update(
            stylistTable.name, 
            stylistTable.columns.stylistID, 
            id, 
            [stylistTable.columns.deleted], 
            [deleted]);
        return handleResponse(res, 200, { data: { user: stylist } });
    } catch (error) {
        console.error("Error updating stylist (soft delete):", error);
        handleError(res, statusCode, error);
    }
};

// Get all stylists
module.exports.getAllStylists = async (req, res) => {
    try {
        const limit = Math.abs(parseInt(req.query.perpage)) || 10;
        const offset = Math.abs(parseInt(req.query.page)) || 0;

        const columns = refactor.columnsRefactor(stylistTable, [usersTable]);

        let conditions = [];
        let logicalOperator = [];
        let join = [
            {
                table: usersTable.name,
                on: `"${stylistTable.name}"."${stylistTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
                type: "INNER"
            }
        ];
        let order = [];

        const stylistList = await baseModel.findWithConditionsJoin(
            stylistTable.name,
            columns,
            conditions,
            logicalOperator,
            join,
            order,
            limit,
            offset
        );

        if (!stylistList || stylistList.length === 0) {
            statusCode = 404;
            throw new Error("No stylists found");
        }

        handleResponse(res, 200, { data: { users: stylistList } });
    } catch (error) {
        console.error("Error retrieving stylist list:", error);
        handleError(res, statusCode, error);
    }
};