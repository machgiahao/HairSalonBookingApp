const baseModel = require("../../../model/base.model");
const table = require("../../../model/table/stylist.table");

// Get stylist details by ID
module.exports.getStylistDetail = async (req, res) => {
    const id = req.params.id;

    try {
        const stylist = await baseModel.findById(table.name, table.columns.stylistID, id);
        if (!stylist) {
            return res.status(404).json({ error: 'Stylist not found' });
        }
        console.log('Retrieved Stylist:', stylist);
        return res.status(200).json({ data: { user: stylist } });
    } catch (error) {
        console.error("Error retrieving stylist:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Update stylist details
module.exports.updateStylist = async (req, res) => {
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
        const updatedStylist = await baseModel.update(table.name, table.columns.stylistID, id, columns, values);
        if (!updatedStylist) {
            return res.status(404).json({ error: 'Stylist not found' });
        }
        console.log('Updated Stylist:', updatedStylist);
        return res.status(200).json({ data: { user: updatedStylist } });
    } catch (error) {
        console.error("Error updating stylist:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Soft delete stylist (toggle deleted status)
module.exports.softDel = async (req, res) => {
    const id = req.params.id;
    const deleted = !req.body.deleted; // Reverse the current deleted value

    const columns = [table.columns.deleted]; 
    const values = [deleted]; 

    try {
        const updatedStylist = await baseModel.update(table.name, table.columns.stylistID, id, columns, values);
        if (!updatedStylist) {
            return res.status(404).json({ error: 'Stylist not found' });
        }
        console.log('Updated Stylist (Soft Delete):', updatedStylist);
        return res.status(200).json({ data: { user: updatedStylist } });
    } catch (error) {
        console.error("Error updating stylist (soft delete):", error);
        return res.status(500).json({ error: error.message });
    }
};

// Get all stylists
module.exports.getAllStylists = async (req, res) => {
    try {
        const stylistList = await baseModel.find(table.name);
        if (!stylistList || stylistList.length === 0) {
            return res.status(404).json({ error: 'No stylists found' });
        }
        console.log('Retrieved Stylist List:', stylistList);
        return res.status(200).json({ data: { users: stylistList } });
    } catch (error) {
        console.error("Error retrieving stylist list:", error);
        return res.status(500).json({ error: error.message });
    }
};
