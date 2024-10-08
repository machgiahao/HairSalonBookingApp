const baseModel = require("../../../model/base.model");
const table = require("../../../model/table/workship.table");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

// Get workship details by ID
module.exports.detail = async (req, res) => {
    const id = req.params.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        const workship = await baseModel.findById(table.name, table.columns.workShiftID, id);
        if (!workship) {
            return handleResponse(res, 404, { error: 'Workship not found' });
        }
        console.log('Retrieved Workship:', workship);
        return handleResponse(res, 200, { data: { workship } });
    } catch (error) {
        console.error("Error retrieving workship:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Create a new workship
module.exports.create = async (req, res) => {
    const { workShiftID, shiftName, startTime, endTime, deleted } = req.body;
    const columns = [
        table.columns.workShiftID,
        table.columns.shiftName,
        table.columns.startTime,
        table.columns.endTime,
        table.columns.deleted
    ];
    
    const values = columns.map(col => req.body[col] || null); // Ensure values map to columns

    try {
        const workship = await baseModel.create(table.name, columns, values);
        if (!workship) {
            return handleResponse(res, 400, { error: 'Failed to create workship' });
        }
        console.log('Created Workship:', workship);
        return handleResponse(res, 201, { data: { workship } });
    } catch (error) {
        console.error("Error creating workship:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Update workship details
module.exports.update = async (req, res) => {
    const id = req.params.id;
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
        const updatedWorkship = await baseModel.update(table.name, table.columns.workShiftID, id, columns, values);
        if (!updatedWorkship) {
            return handleResponse(res, 404, { error: 'Workship not found' });
        }
        console.log('Updated Workship:', updatedWorkship);
        return handleResponse(res, 200, { data: { workship: updatedWorkship } });
    } catch (error) {
        console.error("Error updating workship:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Soft delete workship (toggle deleted status)
module.exports.softDel = async (req, res) => {
    const id = req.params.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        let workship = await baseModel.findById(table.name, table.columns.workShiftID, id);
        if (!workship) {
            return handleResponse(res, 404, { error: 'Workship not found' });
        }
        const deleted = !workship.deleted; // Toggle deleted status
        workship = await baseModel.update(table.name, table.columns.workShiftID, id, [table.columns.deleted], [deleted]);
        console.log('Updated Workship (Soft Delete):', workship);
        return handleResponse(res, 200, { data: { workship } });
    } catch (error) {
        console.error("Error updating workship (soft delete):", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Get all workships
module.exports.getAll = async (req, res) => {
    try {
        const workshipList = await baseModel.find(table.name);
        if (!workshipList || workshipList.length === 0) {
            return handleResponse(res, 404, { error: 'No workships found' });
        }
        console.log('Retrieved Workship List:', workshipList);
        return handleResponse(res, 200, { data: { workships: workshipList } });
    } catch (error) {
        console.error("Error retrieving workship list:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};
