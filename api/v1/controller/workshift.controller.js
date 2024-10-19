const baseModel = require("../../../model/base.model");
const workshift = require("../../../model/table/workshift.table");
const stylistWorkshift = require("../../../model/table/stylistWorkshift.table");
const columnsRefactor = require("../../../helper/columnsRefactor.heper")
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

//--------------------workshift--------------------------------
// Get workshift details by ID
module.exports.detail = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        const workshiftDetails = await baseModel.findById(workshift.name, workshift.columns.workShiftID, id);
        if (!workshiftDetails) {
            return handleResponse(res, 404, { error: 'Workshift not found' });
        }
        console.log('Retrieved Workshift:', workshiftDetails);
        return handleResponse(res, 200, { data: { workshiftDetails } });
    } catch (error) {
        console.error("Error retrieving workshift:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Create a new workshift
module.exports.create = async (req, res) => {
    const columns = [];
    const values = [];
    for (const key in req.body) {
        if (workshift.columns[key] !== undefined && key !== workshift.columns.workShiftID) {  
            columns.push(workshift.columns[key]);
            values.push(req.body[key]);
        }
    }
    try {
        const newWorkshift = await baseModel.create(workshift.name, columns, values);
        if (!newWorkshift) {
            return handleResponse(res, 400, { error: 'Failed to create workshift' });
        }
        console.log('Created Workshift:', newWorkshift);
        return handleResponse(res, 201, { data: { newWorkshift } });
    } catch (error) {
        console.error("Error creating workshift:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Update workshift details
module.exports.update = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    const columns = [];
    const values = [];

    for (const key in req.body) {
        if (workshift.columns[key] !== undefined && key !== workshift.columns.workShiftID) {  
            columns.push(workshift.columns[key]);
            values.push(req.body[key]);
        }
    }

    if (columns.length === 0) {
        return handleResponse(res, 400, { error: 'No valid fields provided for update' });
    }

    try {
        const updatedWorkshift = await baseModel.update(workshift.name, workshift.columns.workShiftID, id, columns, values);
        if (!updatedWorkshift) {
            return handleResponse(res, 404, { error: 'Workshift not found' });
        }
        console.log('Updated Workshift:', updatedWorkshift);
        return handleResponse(res, 200, { data: { updatedWorkshift } });
    } catch (error) {
        console.error("Error updating workshift:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Soft delete workshift (toggle deleted status)
module.exports.softDel = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try {
        let workshiftDetails = await baseModel.findById(workshift.name, workshift.columns.workShiftID, id);
        if (!workshiftDetails) {
            return handleResponse(res, 404, { error: 'Workshift not found' });
        }
        const deleted = !workshiftDetails.deleted; 
        workshiftDetails = await baseModel.update(workshift.name, workshift.columns.workShiftID, id, [workshift.columns.deleted], [deleted]);
        console.log('Updated Workshift (Soft Delete):', workshiftDetails);
        return handleResponse(res, 200, { data: { workshiftDetails } });
    } catch (error) {
        console.error("Error updating workshift (soft delete):", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Get all workshifts
module.exports.getAll = async (req, res) => {
    try {
        const workshiftList = await baseModel.find(workshift.name);
        if (!workshiftList || workshiftList.length === 0) {
            return handleResponse(res, 404, { error: 'No workshifts found' });
        }
        console.log('Retrieved Workshift List:', workshiftList);
        return handleResponse(res, 200, { data: { workshifts: workshiftList } });
    } catch (error) {
        console.error("Error retrieving workshift list:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

//--------------------stylistWorkshift--------------------------------

// Add a Stylist to a WorkShift
module.exports.addStylistToWorkShift = async (req, res) => {
    try {
        const columns = [];
        const values = [];

        for (const key in req.body) {
            if (stylistWorkshift.columns[key] !== undefined && key !== stylistWorkshift.columns.stylistWorkShiftID) {
                columns.push(stylistWorkshift.columns[key]);
                values.push(req.body[key]);
            }
        }

        if (columns.length === 0) {
            return handleResponse(res, 400, { error: 'No valid fields provided for adding stylist to work shift' });
        }

        const stylistID = req.body[stylistWorkshift.columns.stylistID];
        const workShiftID = req.body[stylistWorkshift.columns.workShiftID];

        const existingEntry = await baseModel.findWithConditionsJoinditions(
            stylistWorkshift.name,
            undefined,
            [
                { column: stylistWorkshift.columns.stylistID, value: stylistID },
                { column: stylistWorkshift.columns.workShiftID, value: workShiftID },
            ],
            ["AND"]
        );

        if (existingEntry && existingEntry.length > 0) {
            return handleResponse(res, 400, {
                error: `Stylist ${existingEntry[0].stylistID} is already assigned to this work shift: ${existingEntry[0].workShiftID}`,
            });
        }

        const newStylistWorkShift = await baseModel.create(stylistWorkshift.name, columns, values);
        if (!newStylistWorkShift) {
            return handleResponse(res, 400, { error: 'Failed to add stylist to work shift' });
        }

        console.log('Added Stylist to WorkShift:', newStylistWorkShift);
        return handleResponse(res, 201, { data: { newStylistWorkShift } });
    } catch (error) {
        console.error("Error adding stylist to work shift:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};

// Remove Stylist from a WorkShift
module.exports.removeStylistFromWorkShift = async (req, res) => {
    try {
        const stylistID = req.body[stylistWorkshift.columns.stylistID];
        const workShiftID = req.body[stylistWorkshift.columns.workShiftID];

        if (!stylistID || !workShiftID) {
            return handleResponse(res, 400, { error: "Stylist ID or WorkShift ID missing" });
        }

        const existingEntry = await baseModel.findWithConditionsJoin(
            stylistWorkshift.name,
            undefined,
            [
                { column: stylistWorkshift.columns.stylistID, value: stylistID },
                { column: stylistWorkshift.columns.workShiftID, value: workShiftID }
            ]
        );

        if (!existingEntry || existingEntry.length === 0) {
            return handleResponse(res, 404, { error: "No stylist found in this workshift" });
        }

        const stylistWorkShiftID = existingEntry[0][stylistWorkshift.columns.stylistWorkShiftID];
        const result=await baseModel.deleteById(stylistWorkshift.name, stylistWorkshift.columns.stylistWorkShiftID, stylistWorkShiftID);
        console.log(result);
        return handleResponse(res, 200, { message: "Stylist removed from the work shift successfully" });
        
    } catch (error) {
        console.error("Error removing stylist from work shift:", error);
        return handleResponse(res, 500, { error: "An internal server error occurred" });
    }
};


//get all stylist workshift
module.exports.getAllWorkshift = async (req, res) => {
    try {
        
        const columns = columnsRefactor.columnsRefactor(workshift,[stylistWorkshift]);
        // const workshiftList = await baseModel.findWithConditionsJoin(stylistWorkshift.name,undefined,
        //     [
        //         {column:stylistWorkshift.columns.stylistID, value:req.query.id}
        //     ]);
        const workshiftList = await baseModel.findWithConditionsJoin(
            stylistWorkshift.name,
            undefined,
            [
                {column:stylistWorkshift.columns.stylistID, value:req.query.id},
                {column:`${stylistWorkshift.name}"."${stylistWorkshift.columns.deleted}`, value:false}

            ],
            ["AND"],
            [
                {
                    table: workshift.name, // join with users table
                    on: `"${workshift.name}"."${workshift.columns.workShiftID}" = "${stylistWorkshift.name}"."${stylistWorkshift.columns.workShiftID}"`,
                    type: "INNER" // type of join
                  }
            ]
        );
        if (!workshiftList || workshiftList.length === 0) {
            return handleResponse(res, 404, { error: 'No workshifts found' });
        }
        console.log('Retrieved Workshift List:', workshiftList);
        return handleResponse(res, 200, { data:  workshiftList  });
    } catch (error) {
        console.error("Error retrieving workshift list:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};


// Update stylist workshift details
module.exports.updateStylistWorkshift = async (req, res) => {
    const stylistID = req.body[stylistWorkshift.columns.stylistID];
    const workShiftID = req.body[stylistWorkshift.columns.workShiftID];
    const status = req.body[stylistWorkshift.columns.status]; 

    // Check if stylistID and workShiftID are provided
    if (!stylistID || !workShiftID || !status) {
        return handleResponse(res, 400, { error: "Stylist ID, WorkShift ID, and Status are required" });
    }

    const columns = [stylistWorkshift.columns.status];
    const values = [status];

    // Create conditions for update
    const conditions = [
        { column: stylistWorkshift.columns.stylistID, value: stylistID },
        { column: stylistWorkshift.columns.workShiftID, value: workShiftID }
    ];

    try {
        // Call updateWithConditions to update the status where conditions match
        const updatedStylistWorkshift = await baseModel.updateWithConditions(
            stylistWorkshift.name,
            columns,
            values,
            conditions,
            ["AND"] // Logical operator can be adjusted based on requirements
        );

        if (!updatedStylistWorkshift || updatedStylistWorkshift.length === 0) {
            return handleResponse(res, 404, { error: 'Stylist work shift not found' });
        }

        return handleResponse(res, 200, { data:  updatedStylistWorkshift[0]  });
    } catch (error) {
        console.error("Error updating stylist work shift:", error);
        return handleResponse(res, 500, { error: error.message });
    }
};
