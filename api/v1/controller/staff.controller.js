const baseModel = require("../../../model/base.model");
const staffTable = require("../../../model/table/staff.table");
const usersTable = require("../../../model/table/user.table");
const columnsRefactor= require("../../../helper/columnsRefactor.heper");
const extractField = require("../../../helper/extractField.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");
const table = require("../../../model/table/workshift.table");

// Get staff details by ID
module.exports.getStaffDetail = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        // Define the columns to retrieve from both tables
        const columns = columnsRefactor(staffTable,[usersTable]);
        const staffDetail = await baseModel.findWithConditionsJoin(
            staffTable.name, // main table (staff)
            columns, // columns to select
            [{ column: staffTable.columns.staffID, value: id }], // condition on staffID
            [], // logical operators (defaults to AND)
            [ // joins
              {
                table: usersTable.name, // join with users table
                on: `"${staffTable.name}"."${staffTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
                type: "INNER" // type of join
              }
            ]
        );

        // If no staff member found, return 404
        if (!staffDetail || staffDetail.length === 0) {
            return handleResponse(res, 404, { error: 'Staff member not found' });
        }

        // Log and return the staff detail with joined user data
        console.log('Retrieved Staff Detail with User Info:', staffDetail);
        return handleResponse(res, 200, { data: { user: staffDetail[0] } });
    } catch (error) {
        console.error("Error retrieving staff detail with join:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Soft delete staff member (toggle deleted status)
module.exports.softDel = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        let staff = await baseModel.findById(staffTable.name, staffTable.columns.staffID, id);
        if (!staff) {
            return handleResponse(res, 404, { error: 'Staff member not found' });
        }
        const deleted = !staff.deleted; // Toggle deleted status
        staff = await baseModel.update(staffTable.name, staffTable.columns.staffID, id, [staffTable.columns.deleted], [deleted]);
        console.log('Updated Staff Member (Soft Delete):', staff);
        return handleResponse(res, 200, { data: { user: staff } });
    } catch (error) {
        console.error("Error updating staff member (soft delete):", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Get all staff members
module.exports.getAllStaff = async (req, res) => {
    try {
        const limit = Math.abs(parseInt(req.query.perpage)) || 10; // Default to 10 if invalid

        const offset = Math.abs(parseInt(req.query.page)) || 0; // Default to page 0 if not provided

        const columns = columnsRefactor(staffTable, [usersTable]);

        const staffList = await baseModel.findWithConditionsJoin(
            staffTable.name,  // main table name
            columns,          // columns
            [],               // conditions (can be added later)
            [],               // logical operators (defaults to AND)
            [ // joins
                {
                    table: usersTable.name,
                    on: `"${staffTable.name}"."${staffTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
                    type: "INNER"
                }
            ],
            [],               // order (can be added later)
            limit,            // limit
            offset            // offset for pagination
        );

        if (!staffList || staffList.length === 0) {
            return handleResponse(res, 404, { error: 'No staff members found', limit, offset });
        }

        // Return the retrieved staff list
        return handleResponse(res, 200, { data: { users: staffList } });
    } catch (error) {
        console.error("Error retrieving staff list:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};


// Update staff member details
module.exports.updateStaff = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        const updatedStaff = await baseModel.executeTransaction(async () => { 
            return await extractField([staffTable, usersTable], [staffTable.columns.staffID, usersTable.columns.userID], req);
        });
        
        console.log(updatedStaff);
            
        if (!updatedStaff) {
            return handleResponse(res, 404, { error: 'Staff member not found' });
        }
        console.log('Updated Staff Member:', updatedStaff);
        return handleResponse(res, 200, { data: { user: updatedStaff } });
    } catch (error) {
        console.error("Error updating staff member:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};
