const baseModel = require("../../../model/base.model");
const table = require("../../../model/table/staff.table");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

// Get staff details by ID
module.exports.getStaffDetail = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        const staff = await baseModel.findById(table.name, table.columns.staffID, id);
        if (!staff) {
            return handleResponse(res, 404, { error: 'Staff member not found' });
        }
        console.log('Retrieved Staff Member:', staff);
        return handleResponse(res, 200, { data: { user: staff } });
    } catch (error) {
        console.error("Error retrieving staff member:", error);
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
        if (table.columns[key] !== undefined) {
            columns.push(table.columns[key]);
            values.push(req.body[key]);
        }
    }

    if (columns.length === 0) {
        return handleResponse(res, 400, { error: 'No valid fields provided for update' });
    }

    try {
        const updatedStaff = await baseModel.update(table.name, table.columns.staffID, id, columns, values);
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
        let staff = await baseModel.findById(table.name, table.columns.staffID, id);
        if (!staff) {
            return handleResponse(res, 404, { error: 'Staff member not found' });
        }
        const deleted = !staff.deleted; // Toggle deleted status
        staff = await baseModel.update(table.name, table.columns.staffID, id, [table.columns.deleted], [deleted]);
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
        const staffList = await baseModel.find(table.name);
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
