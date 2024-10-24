const baseModel = require("../../../model/base.model");
const stylistTable = require("../../../model/table/stylist.table");
const usersTable = require("../../../model/table/user.table");
const refactor = require("../../../helper/columnsRefactor.heper");
const extractField = require("../../../helper/extractField.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

// Get stylist details by ID
// Get stylist details by ID using findWithConditionsJoin
module.exports.getStylistDetail = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        // Define the columns to retrieve from both tables
        const columns = refactor.columnsRefactor(stylistTable, [usersTable]);

        let conditions = [{ column: stylistTable.columns.stylistID, value: id }]
        let logicalOperator = []
        let join = [ // joins
            {
                table: usersTable.name, // join with users table
                on: `"${stylistTable.name}"."${stylistTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
                type: "INNER" // type of join
            }
        ]
        let order = []

        const stylistDetail = await baseModel.findWithConditionsJoin(
            stylistTable.name, // main table (stylist)
            columns, // columns to select
            conditions, // condition on stylistID
            logicalOperator, // logical operators (defaults to AND)
            join,
            order
        );

        // If no stylist found, return 404
        if (!stylistDetail || stylistDetail.length === 0) {
            return handleResponse(res, 404, { error: 'Stylist not found' });
        }

        // Log and return the stylist detail with joined user data
        console.log('Retrieved Stylist Detail with User Info:', stylistDetail);
        return handleResponse(res, 200, { data: { user: stylistDetail[0] } });
    } catch (error) {
        console.error("Error retrieving stylist detail with join:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Update stylist details
module.exports.updateStylist = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        const updatedStylist = await baseModel.executeTransaction(async () => { return await extractField([stylistTable, usersTable], [stylistTable.columns.stylistID, usersTable.columns.userID], req, res); })
        if (!updatedStylist) {
            return handleResponse(res, 404, { error: 'Stylist not found' });
        }
        return handleResponse(res, 200, { data: { user: updatedStylist } });
    } catch (error) {
        console.error("Error updating stylist:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Soft delete stylist (toggle deleted status)
module.exports.softDel = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        let stylist = await baseModel.findById(stylistTable.name, stylistTable.columns.stylistID, id);
        if (!stylist) {
            return handleResponse(res, 404, { error: 'Stylist not found' });
        }
        const deleted = !stylist.deleted; // Toggle deleted status
        stylist = await baseModel.update(stylistTable.name, stylistTable.columns.stylistID, id, [stylistTable.columns.deleted], [deleted]);
        console.log('Updated Stylist (Soft Delete):', stylist);
        return handleResponse(res, 200, { data: { user: stylist } });
    } catch (error) {
        console.error("Error updating stylist (soft delete):", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Get all stylists
module.exports.getAllStylists = async (req, res) => {
    try {
        const limit = Math.abs(parseInt(req.query.perpage)) || 10;

        const offset = Math.abs(parseInt(req.query.page)) || 0;

        const columns = refactor.columnsRefactor(stylistTable, [usersTable]);

        let conditions = []
        let logicalOperator = []
        let join = [ // joins
            {
                table: usersTable.name,
                on: `"${stylistTable.name}"."${stylistTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
                type: "INNER"
            }
        ]
        let order = []

        const stylistList = await baseModel.findWithConditionsJoin(
            stylistTable.name,  // main table name
            columns,            // columns
            conditions,         // conditions (can be added later)
            logicalOperator,    // logical operators (defaults to AND)
            join,               //join
            order,              // order (can be added later)
            limit,              // limit
            offset              // offset for pagination
        );

        if (!stylistList || stylistList.length === 0) {
            return handleResponse(res, 404, { error: 'No stylists found', limit, offset });
        }

        // Return the retrieved stylist list with pagination info
        return handleResponse(res, 200, { data: { users: stylistList } });
    } catch (error) {
        console.error("Error retrieving stylist list:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

