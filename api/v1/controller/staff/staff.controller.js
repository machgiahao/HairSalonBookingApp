const baseModel = require("../../../../model/base.model");

module.exports.getStaffDetail = async (req, res) => {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    try {
        // Call the findById method from the base model
        const staff = await baseModel.findById('actor', 'actor_id', id);
        // Check if a staff member was found
        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        // Log the retrieved staff member for debugging purposes
        console.log('Retrieved Staff Member:', staff);
        // Send the staff member details as the response with 200 status
        return res.status(200).json(staff);
    } catch (error) {
        console.error("Error retrieving staff member:", error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports.updateStaff = async (req, res) => {
    const id = req.params.id;

    // This is just a demo for testing. In production, get these from req.body
    const columns = ["first_name"];
    const values = ["tan cuc"];

    // Validate the ID parameter
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    try {
        // Call the update method from the base model
        const updatedStaff = await baseModel.update('actor', 'actor_id', id, columns, values);
        // Check if the update was successful
        if (!updatedStaff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }
        // Log the updated staff member for debugging purposes
        console.log('Updated Staff Member:', updatedStaff);
        // Send the updated staff member details as the response with 200 status
        return res.status(200).json(updatedStaff);
    } catch (error) {
        console.error("Error updating staff member:", error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await baseModel.find("actor");
        // Check if the staff list is empty
        if (!staffList || staffList.length === 0) {
            return res.status(404).json({ error: 'No staff members found' });
        }
        // Log the retrieved staff list for debugging purposes
        console.log('Retrieved Staff List:', staffList);
        // Send the staff list details as the response with 200 status
        return res.status(200).json(staffList);
    } catch (error) {
        console.error("Error retrieving staff list:", error);
        return res.status(500).json({ error: error.message });
    }
};
