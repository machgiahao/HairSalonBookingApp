const baseModel = require("../../../model/base.model");
const stylistTable = require("../../../model/table/stylist.table");
const bookingTable = require("../../../model/table/booking.table");
const salaryTable = require("../../../model/table/salary.table");
const usersTable = require("../../../model/table/user.table");
const dailySalaryTable = require("../../../model/table/dailySalary.table");
const dateRefactor = require("../../../helper/dateRefactor.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");
const refactor = require("../../../helper/columnsRefactor.heper");

module.exports.getAllDailySalary = async (req, res) => {
    const id = req.query.id;
    if (!isValidId(id)) {
        return handleResponse(res, 400, { error: 'Valid ID is required' });
    }

    try {
        const conditions = [{ column: dailySalaryTable.columns.stylistID, value: id }];
        const result = await baseModel.findWithConditionsJoin(dailySalaryTable.name, undefined, conditions);
        return handleResponse(res, 200, { data: result });
    } catch (error) {
        return handleResponse(res, 500, { error: error });
    }
}

module.exports.dailySalary = async (req, res) => {
    const id = req.query.id;
    const requestedDate = req.query.date;

    if (!isValidId(id)) {
        return handleResponse(res, 400, { error: 'Valid ID is required' });
    }

    try {
        const formattedDate = dateRefactor.convert(requestedDate);
        if (!formattedDate) {
            return handleResponse(res, 400, { error: 'Invalid date format' });
        }

        // Calculate bonus
        const bonusConditions = [
            { column: bookingTable.columns.appointmentAt, value: formattedDate },
            { column: bookingTable.columns.deleted, value: false },
            { column: bookingTable.columns.stylistID, value: id }
        ];
        
        const bonus = await baseModel.findWithConditionsJoin(
            bookingTable.name,
            [`SUM("${bookingTable.columns.totalPrice}") AS sum`],
            bonusConditions,
            ["AND", "AND"]
        );

        const bonusSalary = bonus.length && bonus[0]?.sum ? Math.ceil(bonus[0].sum * 0.15) : 0;

        // Check for existing daily salary record
        const dailySalaryConditions = [
            { column: dailySalaryTable.columns.upToDay, value: formattedDate },
            { column: dailySalaryTable.columns.deleted, value: false },
            { column: dailySalaryTable.columns.stylistID, value: id }
        ];

        let result = await baseModel.findWithConditionsJoin(dailySalaryTable.name, undefined, dailySalaryConditions, ["AND", "AND"]);
        let data = await baseModel.executeTransaction(async()=>{
            if (result.length > 0) {
                // Update existing record
                const updateResult = await baseModel.updateWithConditions(
                    dailySalaryTable.name,
                    [dailySalaryTable.columns.salary_bonus],
                    [bonusSalary],
                    dailySalaryConditions
                );
                // return handleResponse(res, 201, { data: updateResult[0] });
                return updateResult[0]
            } else {
                // Insert new record
                const columns = [
                    dailySalaryTable.columns.stylistID,
                    dailySalaryTable.columns.upToDay,
                    dailySalaryTable.columns.salary_bonus,
                    dailySalaryTable.columns.deleted
                ];
                const values = [id, formattedDate, bonusSalary, false];
    
                const insertResult = await baseModel.create(dailySalaryTable.name, columns, values);
                // return handleResponse(res, 201, { data: insertResult });
                return insertResult
            }
        })
        
        return handleResponse(res, 201, { data: data });

    } catch (error) {
        console.error('Error processing daily salary:', error);
        return handleResponse(res, 500, { error: 'Internal Server Error' });
    }
};

module.exports.monthlySalary = async (req, res) => {
    const id = req.query.id;
    const requestedDate = req.query.date;

    if (!isValidId(id)) {
        return handleResponse(res, 400, { error: 'Valid ID is required' });
    }

    try {
        // Get the date range for the current month
        const { date: { firstDay, lastDay } } = dateRefactor.rangeMonth(requestedDate);

        // Prepare query parameters for daily salary
        let columns = [
            `"${dailySalaryTable.name}"."${dailySalaryTable.columns.stylistID}"`, 
            `SUM("${dailySalaryTable.name}"."${dailySalaryTable.columns.salary_bonus}") AS sum`,
            `"${stylistTable.name}"."${stylistTable.columns.userID}"`,
        ];

        let conditions = [
            { column: `${dailySalaryTable.name}"."${dailySalaryTable.columns.upToDay}`, value: [firstDay, lastDay], operator: 'BETWEEN' },
            { column: `${dailySalaryTable.name}"."${dailySalaryTable.columns.deleted}`, value: false },
            { column: `${dailySalaryTable.name}"."${dailySalaryTable.columns.stylistID}`, value: id },
        ];

        

        let joins = [
            { table: stylistTable.name, on: `"${dailySalaryTable.name}"."${dailySalaryTable.columns.stylistID}" = "${stylistTable.name}"."${stylistTable.columns.stylistID}"` },
        ];

        // Execute the query to get daily salary bonus
        const result = await baseModel.findWithConditionsJoin(
            dailySalaryTable.name,
            columns,
            conditions,
            ["AND", "AND", "AND"],
            joins,
            [],
            null,
            null,
            [`"${dailySalaryTable.name}"."${dailySalaryTable.columns.stylistID}"`, `"${stylistTable.name}"."${stylistTable.columns.stylistID}"`]
        );

        let bonusSalary = 0; // Default to no bonus if no records found
        let userID;

        if (result.length && result[0]?.userID) {
            bonusSalary = result[0]?.sum ? Math.ceil(result[0].sum) : 0;
            userID = result[0].userID;
        } else {
            return handleResponse(res, 200, { data: "No daily salary records found." });
        }

        // Prepare conditions for checking/updating the salary table
        conditions = [
            { column: `${salaryTable.columns.userID}`, value: userID },
            { column: `${salaryTable.columns.receivedDate}`, value: lastDay },
            { column: `${salaryTable.columns.deleted}`, value: false }
        ];

        let salary = await baseModel.findWithConditionsJoin(
            salaryTable.name,
            undefined,
            conditions
        );
        let data = await baseModel.executeTransaction(async()=>{
            let baseSalary;
            if (salary.length > 0) {
                // If salary record exists, use the base salary from that record
                baseSalary = salary[0].baseSalary;
                const newSalary = baseSalary + bonusSalary;
                
                // Update existing salary record
                salary = await baseModel.updateWithConditions(
                    salaryTable.name,
                    [salaryTable.columns.totalSalary],
                    [newSalary],
                    conditions
                );
                // return handleResponse(res, 200, { data: salary[0] });
                return salary[0];
            } else {
                baseSalary =  5000000; 

                columns = [
                    salaryTable.columns.baseSalary,
                    salaryTable.columns.totalSalary,
                    salaryTable.columns.receivedDate,
                    salaryTable.columns.deleted,
                    salaryTable.columns.userID
                ];
                let totalSalary = baseSalary + bonusSalary;
                let values = [baseSalary, totalSalary, lastDay, false, userID];
                salary = await baseModel.create(salaryTable.name, columns, values);
                // return handleResponse(res, 201, { data: salary });
                return salary;

            }
        })
        
        return handleResponse(res, 201, { data: data });

    } catch (error) {
        console.error('Error processing monthly salary:', error);
        return handleResponse(res, 500, { error: 'Internal Server Error' });
    }
};

module.exports.updateSalary = async (req,res) => { 

}