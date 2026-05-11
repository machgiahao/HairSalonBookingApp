const { getColsVals } = require("../../../helper/getColsVals.helper");
const guestTable = require("../../../model/table/guest.table");
const guestRepository = require("../repositories/guest.repository");
const isValidId = require("../../../validates/reqIdParam.validate");

class GuestService {
    async create(data) {
        const result = await guestRepository.transaction(async () => {
            const { columns, values } = getColsVals(guestTable, data);
            const guest = await guestRepository.create(columns, values);
            if (!guest) {
                throw { statusCode: 400, message: "Create guest fail" };
            }
            return { guest };
        });

        return { guest: result.guest };
    }

    async getDetail(guestID) {
        if (!isValidId(guestID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const guest = await guestRepository.findById(guestID);
        if (!guest) {
            throw { statusCode: 404, message: "Guest not found" };
        }

        return { data: guest };
    }

    async delete(guestID) {
        if (!isValidId(guestID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const result = await guestRepository.transaction(async () => {
            const deleted = await guestRepository.delete(guestID);
            if (!deleted) {
                throw { statusCode: 400, message: "Update guest fail" };
            }
            return deleted;
        });

        return { data: result };
    }

    async getAll(query) {
        const limit = Math.abs(parseInt(query.perpage)) || null;
        const offset = (Math.abs(parseInt(query.page) || 1) - 1) * limit;

        const guests = await guestRepository.findAll(limit, offset);
        if (!guests || guests.length === 0) {
            throw { statusCode: 400, message: "No records of guest" };
        }

        return { guests };
    }
}

module.exports = new GuestService();