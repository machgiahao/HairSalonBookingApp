const dateRefactor = require("../../../helper/dateRefactor.helper");
const bookingTable = require("../../../model/table/booking.table");
const dailySalaryTable = require("../../../model/table/dailySalary.table");
const salaryTable = require("../../../model/table/salary.table");
const usersTable = require("../../../model/table/user.table");
const stylistTable = require("../../../model/table/stylist.table");
const salaryRepository = require("../repositories/salary.repository");
const isValidId = require("../../../validates/reqIdParam.validate");

class SalaryService {
    async getAllDailySalary(query, stylistID) {
        const limit = Math.abs(parseInt(query.perpage)) || null;
        const offset = (Math.abs(parseInt(query.page) || 1) - 1) * limit;
        const orderDirection = ["ASC", "DESC"].includes(query.order?.toUpperCase()) ? query.order.toUpperCase() : "DESC";
        let order = [{ column: dailySalaryTable.columns.dailyID, direction: orderDirection }];
        let conditions;

        if (stylistID && isValidId(stylistID)) {
            conditions = [{ column: dailySalaryTable.columns.stylistID, value: stylistID }];
        }

        const result = await salaryRepository.findAllDailySalary(limit, offset, order, conditions);
        return { data: result };
    }

    async calculateDailySalary(stylistID, requestedDate) {
        if (!isValidId(stylistID)) {
            throw { statusCode: 400, message: "Valid ID is required" };
        }

        const formattedDate = dateRefactor.convert(requestedDate);
        if (!formattedDate) {
            throw { statusCode: 400, message: "Invalid date format" };
        }

        const columns = [
            `SUM("${bookingTable.columns.discountPrice}") AS sum`,
            `COUNT("${bookingTable.columns.bookingID}") AS count`
        ];
        let logicalOperator = ["AND"];
        let conditions = [
            { column: bookingTable.columns.appointmentAt, value: formattedDate },
            { column: bookingTable.columns.deleted, value: false },
            { column: bookingTable.columns.stylistID, value: stylistID }
        ];

        const bonus = await salaryRepository.findBookingByConditions(conditions, logicalOperator, columns);
        const count = bonus[0]?.count ? bonus[0]?.count : 0;
        const bonusSalary = bonus.length && bonus[0]?.sum ? Math.ceil(bonus[0].sum * 0.20) : 0;

        conditions = [
            { column: dailySalaryTable.columns.upToDay, value: formattedDate },
            { column: dailySalaryTable.columns.deleted, value: false },
            { column: dailySalaryTable.columns.stylistID, value: stylistID }
        ];

        const dailySalaryRecord = await salaryRepository.findDailySalaryByConditions(conditions, logicalOperator);

        const dailySalary = await salaryRepository.transaction(async () => {
            if (dailySalaryRecord.length > 0) {
                const updatedRecord = await salaryRepository.updateWithConditions(
                    [dailySalaryTable.columns.salary_bonus], [bonusSalary], conditions
                );
                return updatedRecord[0];
            } else {
                const columns = [
                    dailySalaryTable.columns.stylistID,
                    dailySalaryTable.columns.upToDay,
                    dailySalaryTable.columns.salary_bonus,
                    dailySalaryTable.columns.deleted
                ];
                const values = [stylistID, formattedDate, bonusSalary, false];
                return await salaryRepository.create(columns, values);
            }
        });

        return { data: dailySalary, count };
    }

    async calculateMonthlySalary(stylistID, requestedDate) {
        if (!isValidId(stylistID)) {
            throw { statusCode: 400, message: "Valid ID is required" };
        }

        const date = dateRefactor.rangeMonth(requestedDate);
        let logicalOperator = ["AND"];
        let conditions = [
            { column: `${usersTable.name}"."${usersTable.columns.deleted}`, value: false },
            { column: `${stylistTable.name}"."${stylistTable.columns.stylistID}`, value: stylistID }
        ];
        let join = [{
            table: stylistTable.name,
            on: `"${usersTable.name}"."${usersTable.columns.userID}" = "${stylistTable.name}"."${stylistTable.columns.userID}"`,
            type: "INNER"
        }];

        const user = await salaryRepository.findUserByConditions(conditions, logicalOperator, join);
        if (user.length <= 0) {
            throw { statusCode: 404, message: "No user found" };
        }

        const userID = user[0].userID;
        conditions = [
            { column: dailySalaryTable.columns.upToDay, value: [date.firstDay, date.lastDay], operator: "BETWEEN" },
            { column: dailySalaryTable.columns.stylistID, value: stylistID },
            { column: dailySalaryTable.columns.deleted, value: false }
        ];
        logicalOperator = ["AND", "AND", "AND"];

        let totalDailySalary = await salaryRepository.findDailySalaryByConditions(conditions, logicalOperator);
        totalDailySalary = totalDailySalary.length > 0 ? totalDailySalary[0].sum : 0;

        conditions = [
            { column: salaryTable.columns.receivedDate, value: date.lastDay },
            { column: salaryTable.columns.deleted, value: false },
            { column: salaryTable.columns.userID, value: userID }
        ];

        let salary = await salaryRepository.findSalaryByConditions(conditions, ["AND", "AND"]);
        salary = await salaryRepository.transaction(async () => {
            if (salary.length > 0) {
                const base = salary[0].baseSalary;
                const columns = [salaryTable.columns.totalSalary];
                const values = [base + totalDailySalary];
                const updateConditions = [
                    { column: salaryTable.columns.userID, value: userID },
                    { column: salaryTable.columns.deleted, value: false },
                    { column: salaryTable.columns.receivedDate, value: date.lastDay }
                ];
                salary = await salaryRepository.updateSalaryWithConditions(columns, values, updateConditions);
                return salary[0];
            } else {
                const base = 7000000;
                const columns = [
                    salaryTable.columns.baseSalary,
                    salaryTable.columns.totalSalary,
                    salaryTable.columns.receivedDate,
                    salaryTable.columns.deleted,
                    salaryTable.columns.userID
                ];
                const values = [base, base + totalDailySalary, date.lastDay, false, userID];
                return await salaryRepository.createSalary(columns, values);
            }
        });

        return { data: salary };
    }

    async updateSalary(salaryID, baseSalary, stylistID) {
        if (!isValidId(salaryID) || !baseSalary) {
            throw { statusCode: 400, message: "Valid ID is required or missing salary value" };
        }

        const conditions = [{ column: salaryTable.columns.salaryID, value: salaryID }];
        const salary = await salaryRepository.findSalaryByConditions(conditions);

        if (salary.length <= 0) {
            throw { statusCode: 404, message: "No salary found" };
        }

        const totalSalary = salary[0].totalSalary - salary[0].baseSalary + baseSalary;
        const columns = [salaryTable.columns.baseSalary, salaryTable.columns.totalSalary];
        const values = [baseSalary, totalSalary];

        const result = await salaryRepository.transaction(async () => {
            return await salaryRepository.updateSalaryWithConditions(columns, values, conditions);
        });

        return { data: result };
    }

    async calculateGeneralMonthlySalary(userID, requestedDate) {
        if (!isValidId(userID)) {
            throw { statusCode: 400, message: "Valid ID is required or missing date" };
        }

        const date = dateRefactor.rangeMonth(requestedDate);

        const stylist = await salaryRepository.findStylistByUserId(userID);
        let bonus = 0;
        let stylistID;

        if (stylist.length > 0) {
            stylistID = stylist[0].stylistID;
            const bonusData = await salaryRepository.findBookingByConditions(
                [
                    { column: `${bookingTable.name}"."${bookingTable.columns.createdAt}`, value: [date.firstDay, date.lastDay], operator: "BETWEEN" },
                    { column: bookingTable.columns.stylistID, value: stylistID },
                    { column: bookingTable.columns.status, value: 'Completed' }
                ],
                ["AND", "AND", "AND"],
                [`SUM("${bookingTable.columns.discountPrice}")`]
            );
            bonus = bonusData.length > 0 ? bonusData[0].sum * 0.15 : 0;
        }

        const salaryConditions = [
            { column: salaryTable.columns.receivedDate, value: date.lastDay },
            { column: salaryTable.columns.deleted, value: false },
            { column: salaryTable.columns.userID, value: userID }
        ];

        let salary = await salaryRepository.findSalaryByConditions(salaryConditions, ["AND", "AND"]);
        salary = await salaryRepository.transaction(async () => {
            const baseSalary = salary.length > 0 ? salary[0].baseSalary : 7000000;
            const totalSalary = baseSalary + bonus;

            if (salary.length > 0) {
                return await salaryRepository.updateSalaryWithConditions(
                    [salaryTable.columns.totalSalary], [totalSalary], salaryConditions
                );
            } else {
                return await salaryRepository.createSalary(
                    [salaryTable.columns.baseSalary, salaryTable.columns.totalSalary, salaryTable.columns.receivedDate, salaryTable.columns.deleted, salaryTable.columns.userID],
                    [baseSalary, totalSalary, date.lastDay, false, userID]
                );
            }
        });

        return { data: salary[0] };
    }
}

module.exports = new SalaryService();