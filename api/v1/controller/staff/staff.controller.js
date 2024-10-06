const baseModel = require("../../../../model/base.model");
const table = require("../../../../model/table/staff.table");

// Get staff details by ID
module.exports.getStaffDetail = async (req, res) => {
    const id = req.params.id;

    try {
        const staff = await baseModel.findById(table.name, table.columns.staffID, id);
        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        console.log('Retrieved Staff Member:', staff);
        return res.status(200).json({ data: { user: staff } });
    } catch (error) {
        console.error("Error retrieving staff member:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Update staff member details
module.exports.updateStaff = async (req, res) => {
    const id = req.params.id;

    // Initialize arrays to hold the columns and values to update
    const columns = [];
    const values = [];

    // Loop through req.body keys and push corresponding columns and values
    for (const key in req.body) {
        if (table.columns[key] !== undefined) {  // Ensure the key is a valid column
            columns.push(table.columns[key]);
            values.push(req.body[key]);
        }
    }

    if (columns.length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    try {
        const updatedStaff = await baseModel.update(table.name, table.columns.staffID, id, columns, values);
        if (!updatedStaff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        console.log('Updated Staff Member:', updatedStaff);
        return res.status(200).json({ data: { user: updatedStaff } });
    } catch (error) {
        console.error("Error updating staff member:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Soft delete staff member (toggle deleted status)
module.exports.softDel = async (req, res) => {
    const id = req.params.id;
    const deleted = !req.body.deleted; // Reverse the current deleted value

    const columns = [table.columns.deleted]; 
    const values = [deleted]; 

    try {
        const updatedStaff = await baseModel.update(table.name, table.columns.staffID, id, columns, values);
        if (!updatedStaff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        console.log('Updated Staff Member (Soft Delete):', updatedStaff);
        return res.status(200).json({ data: { user: updatedStaff } });
    } catch (error) {
        console.error("Error updating staff member (soft delete):", error);
        return res.status(500).json({ error: error.message });
    }
};

// Get all staff members
module.exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await baseModel.find(table.name);
        if (!staffList || staffList.length === 0) {
            return res.status(404).json({ error: 'No staff members found' });
        }
        console.log('Retrieved Staff List:', staffList);
        return res.status(200).json({ data: { users: staffList } });
    } catch (error) {
        console.error("Error retrieving staff list:", error);
        return res.status(500).json({ error: error.message });
    }
};
