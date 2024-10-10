const baseModel = require("../../../model/base.model");
const table = require("../../../model/table/stylist.table");
const cloudinary = require("../../../helper/cloudinary.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

// Get stylist details by ID
module.exports.getStylistDetail = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        const stylist = await baseModel.findById(table.name, table.columns.stylistID, id);
        if (!stylist) {
            return handleResponse(res, 404, { error: 'Stylist not found' });
        }
        console.log('Retrieved Stylist:', stylist);
        return handleResponse(res, 200, { data: { user: stylist } });
    } catch (error) {
        console.error("Error retrieving stylist:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

module.exports.uploadImg = async(req,res)=>{
    cloudinary.uploader.upload(req.file.path ,(err,resulst)=>{
        if(err){
            console.log(error);
            return handleResponse(res, 500, { error: error.message });
        }
        return handleResponse(res, 200, { resulst: { user: resulst } });

    })
}

// Update stylist details
module.exports.updateStylist = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    const columns = [];
    const values = [];

    for (const key in req.body) {
        if (table.columns[key] !== undefined) {  // Ensure the key is a valid column
            columns.push(table.columns[key]);
            values.push(req.body[key]);
        }
    }

    if (columns.length === 0) {
        return handleResponse(res, 400, { error: 'No valid fields provided for update' });
    }

    try {
        const updatedStylist = await baseModel.update(table.name, table.columns.stylistID, id, columns, values);
        if (!updatedStylist) {
            return handleResponse(res, 404, { error: 'Stylist not found' });
        }
        console.log('Updated Stylist:', updatedStylist);
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
        let stylist = await baseModel.findById(table.name, table.columns.stylistID, id);
        if (!stylist) {
            return handleResponse(res, 404, { error: 'Stylist not found' });
        }
        const deleted = !stylist.deleted; // Toggle deleted status
        stylist = await baseModel.update(table.name, table.columns.stylistID, id, [table.columns.deleted], [deleted]);
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
        const stylistList = await baseModel.find(table.name);
        if (!stylistList || stylistList.length === 0) {
            return handleResponse(res, 404, { error: 'No stylists found' });
        }
        console.log('Retrieved Stylist List:', stylistList);
        return handleResponse(res, 200, { data: { users: stylistList } });
    } catch (error) {
        console.error("Error retrieving stylist list:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};
