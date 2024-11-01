const baseModel = require("../../../model/base.model");
const workshift = require("../../../model/table/workshift.table");
const stylistWorkshift = require("../../../model/table/stylistWorkshift.table");
const bookingTable = require("../../../model/table/booking.table");
const columnsRefactor = require("../../../helper/columnsRefactor.heper");
const handleResponse = require("../../../helper/handleReponse.helper");
const handleError = require("../../../helper/handleError.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

//--------------------workshift--------------------------------
// Get workshift details by ID
module.exports.detail = async (req, res) => {
    let statusCode
    try {
        const id = req.query.id;
        if (!isValidId(id)) {
            statusCode=400;
            throw new Error(`Valid ID is required`)
        }

        const workshiftDetails = await baseModel.findById(workshift.name, workshift.columns.workShiftID, id);
        if (!workshiftDetails) {
            statusCode=404
            throw new Error("Workshift not found")
        }
        handleResponse(res, 200, { data: { workshiftDetails } });
    } catch (error) {
        handleError(res, statusCode, error);
    }
};

// Create a new workshift
module.exports.create = async (req, res) => {
    let statusCode
    try {
        const columns = [];
        const values = [];
        for (const key in req.body) {
        if (workshift.columns[key] !== undefined && key !== workshift.columns.workShiftID) {  
            columns.push(workshift.columns[key]);
            values.push(req.body[key]);
        }
    }
        const newWorkshift = await baseModel.create(workshift.name, columns, values);
        if (!newWorkshift) {
            statusCode=400
            throw new Error("Failed to create workshift")
        }
        handleResponse(res, 201, { data: { newWorkshift } });
    } catch (error) {
        handleError(res, statusCode, error);
    }
};

// Update workshift details
module.exports.update = async (req, res) => {
    let statusCode
    try {
        const id = req.query.id;
        if (!isValidId(id)) {
            statusCode=400
            throw new Error('Invalid id')
        }
    
        const columns = [];
        const values = [];
    
        for (const key in req.body) {
            if (workshift.columns[key] !== undefined && key !== workshift.columns.workShiftID) {  
                columns.push(workshift.columns[key]);
                values.push(req.body[key]);
            }
        }
    
        if (columns.length === 0) {
            statusCode=400
            throw new Error('No valid fields provided for update')
        }
        const updatedWorkshift = await baseModel.update(workshift.name, workshift.columns.workShiftID, id, columns, values);
        if (!updatedWorkshift) {
            statusCode=404
            throw new Error('Workshift not found')
        }
        console.log('Updated Workshift:', updatedWorkshift);
        handleResponse(res, 200, { data: { updatedWorkshift } });
    } catch (error) {
        handleError(res, statusCode, error);
    }
};

// Soft delete workshift (toggle deleted status)
module.exports.softDel = async (req, res) => {
    let statusCode
    try {
        const id = req.query.id;
        if (!isValidId(id)) {
            statusCode=400
            throw new Error(`Valid ID is required`)
        }
        let workshiftDetails = await baseModel.findById(workshift.name, workshift.columns.workShiftID, id);
        if (!workshiftDetails) {
            statusCode=404
            throw new Error(`Workshift not found`)
        }
        const deleted = !workshiftDetails.deleted; 
        workshiftDetails = await baseModel.update(workshift.name, workshift.columns.workShiftID, id, [workshift.columns.deleted], [deleted]);
        handleResponse(res, 200, { data: { workshiftDetails } });
    } catch (error) {
        handleError(res, statusCode, error);
    }
};

// Get all workshifts
module.exports.getAll = async (req, res) => {
    let statusCode
    try {
        const workshiftList = await baseModel.find(workshift.name);
        if (!workshiftList || workshiftList.length === 0) {
            statusCode=404
            throw new Error('No workshifts found')
        }
        handleResponse(res, 200, { data: { workshifts: workshiftList } });
    } catch (error) {
        handleError(res, statusCode, error);
    }
};

//--------------------stylistWorkshift--------------------------------


//get all stylist workshift
module.exports.getAllWorkshift = async (req, res) => {
    let statusCode
    try {
        const limit = Math.abs(parseInt(req.query.perpage)) || null;
        const offset = (Math.abs(parseInt(req.query.page) || 1) - 1) * limit;
        const shiftDate = req.query.shiftDate;
        let conditions=[]
        const id = req.query.id

        if (!isValidId(id)) {
            statusCode=400;
            throw new Error(`Valid ID is required`)
        }

        conditions.push({column:`${stylistWorkshift.name}"."${stylistWorkshift.columns.stylistID}`, value:id})
        const orderDirection = ["ASC", "DESC"].includes(req.query.order?.toUpperCase()) 
            ? req.query.order.toUpperCase() 
            : "DESC";


        let order = [{ column: `${stylistWorkshift.name}"."${stylistWorkshift.columns.stylistWorkShiftID}`, direction: orderDirection }];


        let logicalOperator = ["AND"]

        if (shiftDate){
            conditions.push({column:`${workshift.name}"."${workshift.columns.shiftDay}`, value:shiftDate});
            logicalOperator.push("AND");
        }
        const columns = columnsRefactor.columnsRefactor(stylistWorkshift,[workshift]);

        const workshiftList = await baseModel.findWithConditionsJoin(
            stylistWorkshift.name,
            columns,
            conditions,
            logicalOperator,
            [
                {
                    table: workshift.name, 
                    on: `"${workshift.name}"."${workshift.columns.workShiftID}" = "${stylistWorkshift.name}"."${stylistWorkshift.columns.workShiftID}"`,
                    type: "INNER" 
                },
                
            ],
            order,
            limit,
            offset
        );

       
        if (!workshiftList || workshiftList.length === 0) {
            statusCode=404
            throw new Error('No workshifts found')
        }
        handleResponse(res, 200, { data:  workshiftList  });
    } catch (error) {
        handleError(res, statusCode, error);
    }
};

//get all workshift details
module.exports.getAllWorkshiftDetail = async (req, res) => {
    let statusCode

    try {
        const limit = Math.abs(parseInt(req.query.perpage)) || null;
        const offset = (Math.abs(parseInt(req.query.page) || 1) - 1) * limit;
        const orderDirection = ["ASC", "DESC"].includes(req.query.order?.toUpperCase()) 
            ? req.query.order.toUpperCase() 
            : "DESC";
        let order = [{ column: `${stylistWorkshift.name}"."${stylistWorkshift.columns.workShiftID}`, direction: orderDirection }];

        const columns = columnsRefactor.columnsRefactor(workshift,[stylistWorkshift]);
        
        const workshiftList = await baseModel.findWithConditionsJoin(
            stylistWorkshift.name,
            columns,
            [
                {column:`${stylistWorkshift.name}"."${stylistWorkshift.columns.stylistID}`, value:req.query.id},
                {column:`${stylistWorkshift.name}"."${stylistWorkshift.columns.deleted}`, value:false}
            ],
            ["AND"],
            [
                {
                    table: workshift.name, // join with users table
                    on: `"${workshift.name}"."${workshift.columns.workShiftID}" = "${stylistWorkshift.name}"."${stylistWorkshift.columns.workShiftID}"`,
                    type: "INNER" // type of join
                },
                {
                    table: bookingTable.name, // join with booking table
                    on: `"${bookingTable.name}"."${bookingTable.columns.stylistWorkShiftID}" = "${stylistWorkshift.name}"."${stylistWorkshift.columns.stylistWorkShiftID

                    }"`,
                    type: "INNER" // type of join
                },
            ],
            order,limit,offset
        );

       
        if (!workshiftList || workshiftList.length === 0) {
            statusCode = 404
            throw new Error('No workshifts found')
        }
        handleResponse(res, 200, { data:  workshiftList  });
    } catch (error) {
        handleError(res, statusCode, error);
    }
};

// Update stylist workshift details
module.exports.updateStylistWorkshift = async (req, res) => {
    let statusCode
    try {
        const stylistID = req.body[stylistWorkshift.columns.stylistID];
        const workShiftID = req.body[stylistWorkshift.columns.workShiftID];
        const status = req.body[stylistWorkshift.columns.status]; 

        // Check if stylistID and workShiftID are provided
        if (!stylistID || !workShiftID || !status) {
            statusCode=400
            throw new Error("Stylist ID, WorkShift ID, and Status are required")
        }

        const columns = [stylistWorkshift.columns.status];
        const values = [status];

        const conditions = [
            { column: stylistWorkshift.columns.stylistID, value: stylistID },
            { column: stylistWorkshift.columns.workShiftID, value: workShiftID }
        ];
        const updatedStylistWorkshift = await baseModel.updateWithConditions(
            stylistWorkshift.name,
            columns,
            values,
            conditions,
            ["AND"] // Logical operator can be adjusted based on requirements
        );

        if (!updatedStylistWorkshift || updatedStylistWorkshift.length === 0) {
            statusCode=404
            throw new Error('Stylist work shift not found')
        }

        handleResponse(res, 200, { data:  updatedStylistWorkshift[0]  });
    } catch (error) {
        console.error("Error updating stylist work shift:", error);
        handleResponse(res, statusCode, error);
    }
};


module.exports.addStylistToWorkShift = async (req, res) => {
    let statusCode
    try {
        let columns = [];
        let values = [];
        const existedSWorkShift = [];
        const newWorkShift = [];
        let conditions = [];

        const stylistID = req.body[stylistWorkshift.columns.stylistID];
        const workShiftID = [...req.body[stylistWorkshift.columns.workShiftID]];

        if (!stylistID || workShiftID.length <= 0) {
            statusCode=400
            throw new Error("Stylist or WorkShift id are missed")
        }

        for (let id of workShiftID) {  
            columns = [stylistWorkshift.columns.status,stylistWorkshift.columns.deleted];
            values = ["active",false];
            
            let existingEntry = await baseModel.findWithConditionsJoin(
                stylistWorkshift.name,
                undefined,
                [
                    { column: stylistWorkshift.columns.stylistID, value: stylistID },
                    { column: stylistWorkshift.columns.workShiftID, value: id },
                ],
                ["AND"]
            );

            if (existingEntry && existingEntry.length > 0) {
                conditions = [
                    { column: stylistWorkshift.columns.stylistID, value: stylistID },
                    { column: stylistWorkshift.columns.workShiftID, value: id },
                ];
                existingEntry = await baseModel.updateWithConditions(stylistWorkshift.name, columns, values, conditions);
                existedSWorkShift.push(existingEntry);
            } else {
                columns = [
                    stylistWorkshift.columns.stylistID,
                    stylistWorkshift.columns.workShiftID,
                    stylistWorkshift.columns.status,
                    stylistWorkshift.columns.deleted,
                ];
                values = [stylistID, id, "active", false];
                const newStylistWorkShift = await baseModel.create(stylistWorkshift.name, columns, values);
                newWorkShift.push(newStylistWorkShift);
            }
        }

        handleResponse(res, 201, { data: { newWorkShift: newWorkShift, existedSWorkShift: existedSWorkShift } });
    } catch (error) {
        console.error("Error adding stylist to work shift:", error);
        handleError(res, statusCode, error);
    }
};

module.exports.removeStylistFromWorkShift = async (req, res) => {
    let statusCode
    try {
        let columns = [];
        let values = [];
        const removedWorkshift = [];
        const notExistedWorkshift = [];
        let conditions = [];

        const stylistID = req.body[stylistWorkshift.columns.stylistID];
        const workShiftID = [...req.body[stylistWorkshift.columns.workShiftID]];

        if (!stylistID || workShiftID.length <= 0) {
            statusCode=400
            throw new Error(`Stylist or WorkShift are missed`)
        }

        for (let id of workShiftID) {  // Use 'let' to allow reassignment in the loop

            columns = [stylistWorkshift.columns.deleted,stylistWorkshift.columns.status];
            values = [true,'inactive'];
            
            // Declare existingEntry with 'let' to allow reassignment
            let existingEntry = await baseModel.findWithConditionsJoin(
                stylistWorkshift.name,
                undefined,
                [
                    { column: stylistWorkshift.columns.stylistID, value: stylistID },
                    { column: stylistWorkshift.columns.workShiftID, value: id },
                ],
                ["AND"]
            );

            if (existingEntry && existingEntry.length > 0) {
                conditions = [
                    { column: stylistWorkshift.columns.stylistID, value: stylistID },
                    { column: stylistWorkshift.columns.workShiftID, value: id },
                ];
                existingEntry = await baseModel.updateWithConditions(stylistWorkshift.name, columns, values, conditions);
                removedWorkshift.push(existingEntry);
            } else {
                notExistedWorkshift.push(id);
            }
        }

        handleResponse(res, 201, { data: { removedWorkshift: removedWorkshift, notExistedWorkshift: notExistedWorkshift } });
    } catch (error) {
        console.error("Error adding stylist to work shift:", error);
        handleError(res, statusCode, error);
    }
};
