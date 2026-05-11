const staffTable = require("../../../model/table/staff.table");
const usersTable = require("../../../model/table/user.table");
const staffRepository = require("../repositories/staff.repository");
const extractField = require("../../../helper/extractField.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

class StaffService {
    async getDetail(staffID) {
        if (!isValidId(staffID)) {
            throw { statusCode: 400, message: "Invalid id" };
        }

        const staffDetail = await staffRepository.findStaffById(staffID);

        if (!staffDetail || staffDetail.length === 0) {
            throw { statusCode: 404, message: "No staff found" };
        }

        return { user: staffDetail[0] };
    }

    async getAll(query) {
        const limit = Math.abs(parseInt(query.perpage)) || null;
        const offset = (Math.abs(parseInt(query.page) || 1) - 1) * limit;

        const orderDirection = ["ASC", "DESC"].includes(query.order?.toUpperCase())
            ? query.order.toUpperCase()
            : "DESC";
        const order = [{ column: `${staffTable.name}"."${staffTable.columns.staffID}`, direction: orderDirection }];

        const staffList = await staffRepository.findAllStaff(limit, offset, order);

        if (!staffList || staffList.length === 0) {
            throw { statusCode: 404, message: "No staff members found" };
        }

        return { users: staffList };
    }

    async update(staffID, req) {
        if (!isValidId(staffID)) {
            throw { statusCode: 400, message: "Valid ID is required" };
        }

        const updatedStaff = await staffRepository.transaction(async () => {
            return await extractField(
                [staffTable, usersTable],
                [staffTable.columns.staffID, usersTable.columns.userID],
                req
            );
        });

        if (!updatedStaff) {
            throw { statusCode: 404, message: "Staff member not found" };
        }

        return { user: updatedStaff };
    }

    async toggleDelete(staffID) {
        if (!isValidId(staffID)) {
            throw { statusCode: 400, message: "Valid ID is required" };
        }

        const staff = await staffRepository.findStaffById(staffID);
        if (!staff || staff.length === 0) {
            throw { statusCode: 404, message: "Staff member not found" };
        }

        const deleted = !staff[0].deleted;
        const updated = await staffRepository.toggleDelete(staffID, deleted);

        return { user: updated };
    }
}

module.exports = new StaffService();