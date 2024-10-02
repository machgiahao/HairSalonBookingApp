const baseModel = require("../../../../model/base.model");

module.exports.getStylistDetail = async (req, res) => {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    try {
        // Call the findById method from the base model
        const stylist = await baseModel.findById('actor', 'actor_id', id);
        // Check if a stylist was found
        if (!stylist) {
            return res.status(404).json({ error: 'Stylist not found' });
        }
        // Log the retrieved stylist for debugging purposes
        console.log('Retrieved Stylist:', stylist);
        // Send the stylist details as the response with 200 status
        return res.status(200).json(stylist);
    } catch (error) {
        console.error("Error retrieving stylist:", error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports.updateStylist = async (req, res) => {
    const id = req.params.id;

    // This is just a demo for testing. In production, get these from req.body
    const columns = ["first_name"];
    const values = ["tan cuc"]; // Change this to the appropriate value as needed

    // Validate the ID parameter
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    try {
        // Call the update method from the base model
        const updatedStylist = await baseModel.update('actor', 'actor_id', id, columns, values);
        // Check if the update was successful
        if (!updatedStylist) {
            return res.status(404).json({ error: 'Stylist not found' });
        }
        // Log the updated stylist for debugging purposes
        console.log('Updated Stylist:', updatedStylist);
        // Send the updated stylist details as the response with 200 status
        return res.status(200).json(updatedStylist);
    } catch (error) {
        console.error("Error updating stylist:", error);
        return res.status(500).json({ error: error.message });
    }
};

module.exports.getAllStylists = async (req, res) => {
    try {
        const stylistList = await baseModel.find("actor");
        // Check if the stylist list is empty
        if (!stylistList || stylistList.length === 0) {
            return res.status(404).json({ error: 'No stylists found' });
        }
        // Log the retrieved stylist list for debugging purposes
        console.log('Retrieved Stylist List:', stylistList);
        // Send the stylist list details as the response with 200 status
        return res.status(200).json(stylistList);
    } catch (error) {
        console.error("Error retrieving stylist list:", error);
        return res.status(500).json({ error: error.message });
    }
};
