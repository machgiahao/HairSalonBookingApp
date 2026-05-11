const stylistTable = require("../../../model/table/stylist.table");
const usersTable = require("../../../model/table/user.table");
const stylistRepository = require("../repositories/stylist.repository");
const extractField = require("../../../helper/extractField.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

class StylistService {
    async getDetail(stylistID) {
        if (!isValidId(stylistID)) {
            throw { statusCode: 400, message: "Invalid id" };
        }

        const stylistDetail = await stylistRepository.findStylistById(stylistID);

        if (!stylistDetail || stylistDetail.length === 0) {
            throw { statusCode: 404, message: "No stylist found" };
        }

        return { user: stylistDetail[0] };
    }

    async getAll(query) {
        const limit = Math.abs(parseInt(query.perpage)) || null;
        const offset = (Math.abs(parseInt(query.page) || 1) - 1) * limit;

        const orderDirection = ["ASC", "DESC"].includes(query.order?.toUpperCase())
            ? query.order.toUpperCase()
            : "DESC";
        const order = [{ column: `${stylistTable.name}"."${stylistTable.columns.stylistID}`, direction: orderDirection }];

        const stylistList = await stylistRepository.findAllStylists(limit, offset, order);

        if (!stylistList || stylistList.length === 0) {
            throw { statusCode: 404, message: "No stylists found" };
        }

        return { users: stylistList };
    }

    async update(stylistID, req) {
        if (!isValidId(stylistID)) {
            throw { statusCode: 400, message: "Valid ID is required" };
        }

        const updatedStylist = await stylistRepository.transaction(async () => {
            return await extractField(
                [stylistTable, usersTable],
                [stylistTable.columns.stylistID, usersTable.columns.userID],
                req
            );
        });

        if (!updatedStylist) {
            throw { statusCode: 404, message: "Stylist not found" };
        }

        return { user: updatedStylist };
    }

    async toggleDelete(stylistID) {
        if (!isValidId(stylistID)) {
            throw { statusCode: 400, message: "Valid ID is required" };
        }

        const stylist = await stylistRepository.findStylistById(stylistID);
        if (!stylist || stylist.length === 0) {
            throw { statusCode: 404, message: "Stylist not found" };
        }

        const deleted = !stylist[0].deleted;
        const updated = await stylistRepository.toggleDelete(stylistID, deleted);

        return { user: updated };
    }
}

module.exports = new StylistService();