const baseModel = require("../../../model/base.model");
const staffTable = require("../../../model/table/staff.table");
const usersTable = require("../../../model/table/user.table");
const columnsRefactor= require("../../../helper/columnsRefactor.heper");
const extractField = require("../../../helper/extractField.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

// Get staff details by ID
// Get staff details by ID with a join to the users table
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


// Update staff member details
module.exports.updateStaff = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    const columns = [];
    const values = [];

    for (const key in req.body) {
        if (staffTable.columns[key] !== undefined) {
            columns.push(staffTable.columns[key]);
            values.push(req.body[key]);
        }
    }

    if (columns.length === 0) {
        return handleResponse(res, 400, { error: 'No valid fields provided for update' });
    }

    try {
        const updatedStaff = await baseModel.update(staffTable.name, staffTable.columns.staffID, id, columns, values);
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
        const columns=columnsRefactor(staffTable,[usersTable]);
        const staffList = await baseModel.findWithConditionsJoin(
            staffTable.name,  // main table name
            columns, // columns
            [],
            [], // logical operators (defaults to AND)
            [ // joins
              {
                table: usersTable.name,
                on: `"${staffTable.name}"."${staffTable.columns.userID}" = "${usersTable.name}"."${usersTable.columns.userID}"`,
                type: "INNER"
              }
            ]
          );
        if (!staffList || staffList.length === 0) {
            return handleResponse(res, 404, { error: 'No staff members found' });
        }
        console.log('Retrieved Staff List:', staffList);
        return handleResponse(res, 200, { data: { users: staffList } });
    } catch (error) {
        console.error("Error retrieving staff list:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};
