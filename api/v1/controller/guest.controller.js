const baseModel = require("../../../model/base.model");
const guestTable = require("../../../model/table/guest.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

const guestController = {
    create: async (req, res) => {
        let statusCode
        try {
            const result = await baseModel.executeTransaction(async () => {
                const { columns, values } = getColsVals(guestTable, req.body);
                const guest = await baseModel.create(guestTable.name, columns, values);
                if (!guest) {
                    statusCode = 400
                    throw new Error("Create guest fail")
                }
                return { guest: guest };
            })

            return handleResponse(res, 200, { guest: result.guest })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    detail: async (req, res) => {
        let statusCode
        try {
            const id = req.query.id;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const guest = await baseModel.findByField(guestTable.name, guestTable.columns.guestID, id);
            if (!guest) {
                statusCode = 404
                throw new Error("Guest not found")
            }

            return handleResponse(res, 200, { data: guest })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    delete: async (req, res) => {
        let statusCode
        try {
            const id = req.query.id;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const result = await baseModel.executeTransaction(async () => {
                const deleted = await baseModel.update(guestTable.name, guestTable.columns.guestID, id, ["deleted"], [true]);
                if (!deleted) {
                    throw new Error("Update guest fail");
                }
                return deleted
            })

            return handleResponse(res, 200, { data: result })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    getAll: async (req, res) => {
        let statusCode
        try {
            const limit = Math.abs(parseInt(req.query.perpage)) || null;
            const offset = (Math.abs(parseInt(req.query.page) || 1) - 1) * limit;

            const guests = await baseModel.findWithConditions(
                guestTable.name,
                undefined,
                [],
                [],
                [],
                limit,
                offset
            )

            if (!guests || guests.length === 0) {
                statusCode = 400
                throw new Error("No records of guest");
            }
            
            return handleResponse(res, 200, { guests: guests })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    }

}

module.exports = guestController;
