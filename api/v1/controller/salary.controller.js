const baseModel = require("../../../model/base.model");
const stylistTable = require("../../../model/table/stylist.table");
const usersTable = require("../../../model/table/user.table");
const bookingTable = require("../../../model/table/booking.table");
const salaryTable = require("../../../model/table/salary.table");
const dailySalaryTable = require("../../../model/table/dailySalary.table");
const extractField = require("../../../helper/extractField.helper");
const columnsRefactor= require("../../../helper/columnsRefactor.heper");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

module.exports.create = async (req,res)=>{
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try{
    const columns = [];
    const values = [];

    for (const key in req.body) {
        if (salaryTable.columns[key] !== undefined) {
            columns.push(salaryTable.columns[key]);
            values.push(req.body[key]);
        }
    }

    if (columns.length === 0) {
        return handleResponse(res, 400, { error: 'No valid fields provided for update' });
    }

    const result = await baseModel.create(salaryTable.name,columns,values);

    return handleResponse(res,200,{data:result})

    }catch(error) {
        return handleResponse(res,200,{error:error})

    }
}

module.exports.newDaily = async (req,res)=>{
    const id = req.query.id;
    if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

    try{
    const columns = [];
    const values = [];

    for (const key in req.body) {
        if (dailySalaryTable.columns[key] !== undefined) {
            columns.push(dailySalaryTable.columns[key]);
            values.push(req.body[key]);
        }
    }

    if (columns.length === 0) {
        return handleResponse(res, 400, { error: 'No valid fields provided for update' });
    }

    const result = await baseModel.create(dailySalaryTable.name,columns,values);

    return handleResponse(res,200,{data:result})

    }catch(error) {
        return handleResponse(res,500,{error:error})

    }
}

module.exports.dailySalary = async (req, res) => {
    const id = req.query.id;
    const requestedDate = req.query.date; 

    if (!isValidId(id)) {
        return handleResponse(res, 400, { error: 'Valid ID is required' });
    }

    try {
        // Use requested date if provided, otherwise use the current date
        const dateToUse = requestedDate ? new Date(requestedDate) : new Date();
        
        // Format the date to YYYY-MM-DD 00:00:00 for timestamp without timezone
        const formattedDate = dateToUse.toISOString().split('T')[0] + " 00:00:00"; 

        let result = await baseModel.findWithConditionsJoin(
            dailySalaryTable.name,
            undefined, // Select all columns
            [
                { column: dailySalaryTable.columns.upToDay, value: formattedDate },
                { column: dailySalaryTable.columns.deleted, value: false },
                { column: dailySalaryTable.columns.stylistID, value: id }
            ],
            ["AND", "AND"] // Logical operators for conditions
        );

        if (result.length > 0) {
            return handleResponse(res, 200, { data: result[0] }); 
        } else {
            // No existing record found; prepare to insert a new one
            const columns = [];
            const values = [id, formattedDate, 0, false];

            for (const key in dailySalaryTable.columns) {
                if (dailySalaryTable.columns[key] !== dailySalaryTable.columns.dailyID) {
                    columns.push(dailySalaryTable.columns[key]);
                }
            }

            // Insert new record
            result = await baseModel.create(dailySalaryTable.name, columns, values);
            return handleResponse(res, 201, { data: result }); // Return newly created record
        }
    } catch (error) {
        console.error('Error processing daily salary:', error);
        return handleResponse(res, 500, { error: 'Internal Server Error' });
    }
};
