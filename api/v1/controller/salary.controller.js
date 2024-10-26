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

    try {
        let conditions =undefined;

        if(id){
            if (isValidId(id)) {
                conditions=[{ column: dailySalaryTable.columns.stylistID, value: id }]
            }
        }
        const result = await baseModel.findWithConditionsJoin(dailySalaryTable.name, undefined, conditions);
        return handleResponse(res, 200, { data: result });
    } catch (error) {
        return handleResponse(res, 500, { error: error });
    }
}

module.exports.dailySalary = async (req, res) => {
    const stylistID = req.query.id;
    const requestedDate = req.query.date;

    if (!isValidId(stylistID)) {
        return handleResponse(res, 400, { error: 'Valid ID is required' });
    }

    try {
        const formattedDate = dateRefactor.convert(requestedDate);
        if (!formattedDate) {
            return handleResponse(res, 400, { error: 'Invalid date format' });
        }
        console.log(formattedDate)
        let columns=[
            `SUM("${bookingTable.columns.discountPrice}") AS sum`,
            `COUNT("${bookingTable.columns.bookingID}") AS count`
        ];
        let values;
        let logicalOperator = ["AND"];
        let conditions = [
            { column: bookingTable.columns.appointmentAt, value: formattedDate },
            { column: bookingTable.columns.deleted, value: false },
            { column: bookingTable.columns.stylistID, value: stylistID }
        ];

        const bonus = await baseModel.findWithConditionsJoin(
            bookingTable.name,
            columns,
            conditions,
            logicalOperator
        );

        const count = bonus[0]?.count ? bonus[0]?.count : 0
        const bonusSalary = bonus.length && bonus[0]?.sum ? Math.ceil(bonus[0].sum * 0.20) : 0;

        conditions = [
            { column: dailySalaryTable.columns.upToDay, value: formattedDate },
            { column: dailySalaryTable.columns.deleted, value: false },
            { column: dailySalaryTable.columns.stylistID, value: stylistID }
        ];

        let dailySalaryRecord = await baseModel.findWithConditionsJoin(
            dailySalaryTable.name,
            undefined,
            conditions,
            logicalOperator
        );

        const dailySalary = await baseModel.executeTransaction(async () => {
            if (dailySalaryRecord.length > 0) {
                columns = [dailySalaryTable.columns.salary_bonus];
                values = [bonusSalary];
                const updatedRecord = await baseModel.updateWithConditions(
                    dailySalaryTable.name,
                    columns,
                    values,
                    conditions
                );
                return updatedRecord[0];
            } else {
                columns = [
                    dailySalaryTable.columns.stylistID,
                    dailySalaryTable.columns.upToDay,
                    dailySalaryTable.columns.salary_bonus,
                    dailySalaryTable.columns.deleted
                ];
                values = [stylistID, formattedDate, bonusSalary, false];

                const insertedRecord = await baseModel.create(
                    dailySalaryTable.name,
                    columns,
                    values
                );
                return insertedRecord;
            }
        });

        return handleResponse(res, 201, { data: dailySalary , count:count});
    } catch (error) {
        console.error('Error processing daily salary:', error);
        return handleResponse(res, 500, { error: 'Internal Server Error' });
    }
};

module.exports.monthlySalary = async (req, res) => {
    let id = req.query.id;
    const requestedDate = req.query.date;

    if (!isValidId(id)) {
        return handleResponse(res, 400, { error: 'Valid ID is required' });
    }

    try {
        const date = dateRefactor.rangeMonth(requestedDate);
        let columns
        let values
        let userID
        let logicalOperator=["AND"];
        let conditions =[
            {column:`${usersTable.name}"."${usersTable.columns.deleted}`,value:false},
            {column:`${stylistTable.name}"."${stylistTable.columns.stylistID}`,value:id},
        ]
        let join =[
            {
                table:stylistTable.name,
                on:`"${usersTable.name}"."${usersTable.columns.userID}" = "${stylistTable.name}"."${stylistTable.columns.userID}"`,
                type:"INNER"
            }
        ]

        let user = await baseModel.findWithConditionsJoin(
            usersTable.name,
            undefined,
            conditions,
            logicalOperator,
            join
        )

        if(user.length>0){
            userID=user[0].userID;
            console.log(id);
        }else{
            return handleResponse(res,404,{error:"No user found"})
        }

        conditions=[
            {column:dailySalaryTable.columns.upToDay,value:[date.firstDay,date.lastDay],operator:"BETWEEN"},
            {column:dailySalaryTable.columns.stylistID,value:id},
            {column:dailySalaryTable.columns.deleted,value:false},
            
        ]
        logicalOperator=["AND","AND","AND"];
        let totalDailySalary= await baseModel.findWithConditionsJoin(
            dailySalaryTable.name,
            [`SUM(${dailySalaryTable.columns.salary_bonus})`],
            conditions,
            logicalOperator
        )

        totalDailySalary= totalDailySalary.length>0 ? totalDailySalary[0].sum : 0;

        conditions = [
            {column:salaryTable.columns.receivedDate,value:date.lastDay},
            {column:salaryTable.columns.deleted,value:false},
            {column:salaryTable.columns.userID,value:userID},
        ]

        let salary = await baseModel.findWithConditionsJoin(
            salaryTable.name,
            undefined,
            conditions,
            ["AND","AND"],
        )
        salary = await baseModel.executeTransaction(async()=>{
            if(salary.length>0){
                const base= salary[0].baseSalary 
                columns=[salaryTable.columns.totalSalary]
                values=[base+totalDailySalary]
                conditions=[
                    {column:salaryTable.columns.userID,value:userID},
                    {column:salaryTable.columns.deleted,value:false},
                    {column:salaryTable.columns.receivedDate,value:date.lastDay}
                ]
                salary= await baseModel.updateWithConditions(salaryTable.name,columns,values,conditions)
                return salary[0]
            }
            else{
                const base=7000000
                columns=[
                    salaryTable.columns.baseSalary,
                    salaryTable.columns.totalSalary,
                    salaryTable.columns.receivedDate,
                    salaryTable.columns.deleted,
                    salaryTable.columns.userID
                ]
                values=[base,base+totalDailySalary,date.lastDay,false,userID]
                return salary= await baseModel.create(
                    salaryTable.name,columns,values
                )  
            }
        })
        

        return handleResponse(res, 200, { data: salary });
        

    } catch (error) {
        console.error('Error processing monthly salary:', error);
        return handleResponse(res, 500, { error: 'Internal Server Error' });
    }
};

module.exports.updateSalary = async (req,res) => { 
    const id = req.query.id;
    if (!isValidId(id) || !req.body.baseSalary) {
        return handleResponse(res, 400, { error: 'Valid ID is required or missing salary value' });
    }
    let conditions = [
        {column:salaryTable.columns.salaryID,value:req.body.salaryID},
    ]

    let salary = await baseModel.findWithConditionsJoin(salaryTable.name,undefined,conditions)

    if(salary.length<=0)  handleResponse(res, 400, { message: 'No salary found' });
    let totalSalary = salary[0].totalSalary-salary[0].baseSalary + req.body.baseSalary;

    let columns=[salaryTable.columns.baseSalary,salaryTable.columns.totalSalary]
    
    let values=[req.body.baseSalary,totalSalary]

    
    try{
         salary = await baseModel.executeTransaction(async()=>{
            salary= await baseModel.updateWithConditions(salaryTable.name,columns,values,conditions)
            return salary;
        })
        return handleResponse(res, 201, { data: salary });

    }catch(error){
        console.error('Error processing monthly salary:', error);
        return handleResponse(res, 500, { error: 'Internal Server Error' });
    }
    
}

module.exports.generalMonthlySalary = async (req, res) => {
    let id = req.query.id;
    const requestedDate = req.query.date;

    if (!isValidId(id)) {
        return handleResponse(res, 400, { error: 'Valid ID is required' });
    }

    try {
        const date = dateRefactor.rangeMonth(requestedDate);
        let columns
        let values
        let userID
        let logicalOperator=["AND"];
        let conditions =[
            {column:`${usersTable.columns.deleted}`,value:false},
            {column:`${usersTable.columns.userID}`,value:id},
        ]    

        if(id){
            userID=id;
            console.log(id);
        }else{
            return handleResponse(res,404,{error:"No user found"})
        }

        
        conditions = [
            {column:salaryTable.columns.receivedDate,value:date.lastDay},
            {column:salaryTable.columns.deleted,value:false},
            {column:salaryTable.columns.userID,value:userID},
        ]

        let salary = await baseModel.findWithConditionsJoin(
            salaryTable.name,
            undefined,
            conditions,
            ["AND","AND"],
        )
        salary = await baseModel.executeTransaction(async()=>{
            if(salary.length>0){
                return salary[0]
            }
            else{
                const base=7000000
                columns=[
                    salaryTable.columns.baseSalary,
                    salaryTable.columns.totalSalary,
                    salaryTable.columns.receivedDate,
                    salaryTable.columns.deleted,
                    salaryTable.columns.userID
                ]
                values=[base,base,date.lastDay,false,userID]
                return salary= await baseModel.create(
                    salaryTable.name,columns,values
                )  
            }
        })
        

        return handleResponse(res, 200, { data: salary });
        

    } catch (error) {
        console.error('Error processing monthly salary:', error);
        return handleResponse(res, 500, { error: 'Internal Server Error' });
    }
};