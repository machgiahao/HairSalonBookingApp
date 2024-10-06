const baseModel = require("../../../../model/base.model");
const table = require("../../../../model/table/staff.table");

// Get staff details by ID
module.exports.getStaffDetail = async (req, res) => {
    const id = "ST001"; // Hardcoded ID for demonstration

    try {
        const staff = await baseModel.findById(table.name, table.columnId, id);
        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        console.log('Retrieved Staff Member:', staff);
        return res.status(200).json(staff);
    } catch (error) {
        console.error("Error retrieving staff member:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Update staff member details
module.exports.updateStaff = async (req, res) => {
    const id = "ST001"; // Hardcoded ID for demonstration

    // This is just a demo for testing. In production, get these from req.body
    const columns = [table.columns.fullName]; // Example column
    const values = ["tan nhu cc"]; // Example value

    try {
        const updatedStaff = await baseModel.update(table.name, table.columnId, id, columns, values);
        if (!updatedStaff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        console.log('Updated Staff Member:', updatedStaff);
        return res.status(200).json(updatedStaff);
    } catch (error) {
        console.error("Error updating staff member:", error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports.softDel = async (req, res) => {
    const id = "ST001"; // Hardcoded ID for demonstration

    // This is just a demo for testing. In production, get these from req.body
    const columns = [table.columns.deleted]; // Example column
    const values = [false]; // Example value

    try {
        const updatedStaff = await baseModel.update(table.name, table.columnId, id, columns, values);
        if (!updatedStaff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        console.log('Updated Staff Member:', updatedStaff);
        return res.status(200).json(updatedStaff);
    } catch (error) {
        console.error("Error updating staff member:", error);
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
        return res.status(200).json(staffList);
    } catch (error) {
        console.error("Error retrieving staff list:", error);
        return res.status(500).json({ error: error.message });
    }
};
