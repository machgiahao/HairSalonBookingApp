const baseModel = require("../../../model/base.model");
const stylistTable = require("../../../model/table/stylist.table");
const usersTable = require("../../../model/table/user.table");
const bookingTable = require("../../../model/table/booking.table");
const salaryTable = require("../../../model/table/salary.table");
const dailySalaryTable = require("../../../model/table/dailySalary.table");
const extractField = require("../../../helper/extractField.helper");
const dateRefactor = require("../../../helper/dateRefactor.helper")
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

// module.exports.newDaily = async (req,res)=>{
//     const id = req.query.id;
//     if (!isValidId(id)) return handleResponse(res, 400, { error: 'Valid ID is required' });

//     try{
//     const columns = [];
//     const values = [];

//     for (const key in req.body) {
//         if (dailySalaryTable.columns[key] !== undefined) {
//             columns.push(dailySalaryTable.columns[key]);
//             values.push(req.body[key]);
//         }
//     }

//     if (columns.length === 0) {
//         return handleResponse(res, 400, { error: 'No valid fields provided for update' });
//     }

//     const result = await baseModel.create(dailySalaryTable.name,columns,values);

//     return handleResponse(res,200,{data:result})

//     }catch(error) {
//         return handleResponse(res,500,{error:error})

//     }
// }

module.exports.dailySalary = async (req, res) => {
    const id = req.query.id;
    const requestedDate = req.query.date; 

    // Validate ID
    if (!isValidId(id)) {
        return handleResponse(res, 400, { error: 'Valid ID is required' });
    }

    try {
        // Validate date
        const formattedDate = dateRefactor.convert(requestedDate);
        if (!formattedDate) {
            return handleResponse(res, 400, { error: 'Invalid date format' });
        }

        let bonus = await baseModel.findWithConditionsJoin(
            bookingTable.name,
            [`SUM("${bookingTable.columns.totalPrice}") AS sum`], // Sum totalPrice as 'sum'
            [
                { column: bookingTable.columns.appointmentAt, value: formattedDate },
                { column: bookingTable.columns.deleted, value: false },
                { column: bookingTable.columns.stylistID, value: id }
            ],
            ["AND", "AND"]
        );

        const bonusSalary = bonus.length && bonus[0]?.sum ? bonus[0].sum * 15 / 100 : 0;

        let result = await baseModel.findWithConditionsJoin(
            dailySalaryTable.name,
            undefined, // Select all columns
            [
                { column: dailySalaryTable.columns.upToDay, value: formattedDate },
                { column: dailySalaryTable.columns.deleted, value: false },
                { column: dailySalaryTable.columns.stylistID, value: id }
            ],
            ["AND", "AND"]
        );

        if (result.length > 0) {
            const updateResult = await baseModel.updateWithConditions(
                dailySalaryTable.name,
                [dailySalaryTable.columns.salary_bonus],
                [bonusSalary],
                [
                    { column: dailySalaryTable.columns.upToDay, value: formattedDate },
                    { column: dailySalaryTable.columns.deleted, value: false },
                    { column: dailySalaryTable.columns.stylistID, value: id }
                ]
            );
            return handleResponse(res, 201, { data: updateResult[0] });
        } else {
            // No record exists; insert a new one
            const columns = [
                dailySalaryTable.columns.stylistID,
                dailySalaryTable.columns.upToDay,
                dailySalaryTable.columns.salary_bonus,
                dailySalaryTable.columns.deleted
            ];

            const values = [id, formattedDate, bonusSalary, false];

            // Insert new record
            const insertResult = await baseModel.create(dailySalaryTable.name, columns, values);
            return handleResponse(res, 201, { data: insertResult });
        }
    } catch (error) {
        console.error('Error processing daily salary:', error);
        return handleResponse(res, 500, { error: 'Internal Server Error' });
    }
};
