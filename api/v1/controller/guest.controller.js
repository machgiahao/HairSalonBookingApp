const baseModel = require("../../../model/base.model");
const guestTable = require("../../../model/table/guest.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");

const guestController = {
    create: async (req, res) => {
        try {
            const result = await baseModel.executeTransaction(async () => {
                const { columns, values } = getColsVals(guestTable, req.body);
                const guest = await baseModel.create(guestTable.name, columns, values);
                if (!guest) {
                    throw new Error("Cannot create")
                }
                return { guest: guest };
            })
            return res.status(200).json({
                success: true,
                guest: result.guest
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    },

    detail: async (req, res) => {
        try {
            const id = req.query.id;

            const guest = await baseModel.findByField(guestTable.name, guestTable.columns.guestID, id);
            if (!guest) {
                throw new Error("Guest not found")
            }

            return res.status(200).json({
                success: true,
                data: guest
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    },

    delete: async (req, res) => {
        try {
            const id = req.query.id;

            const result = await baseModel.executeTransaction(async () => {
                const deleted = await baseModel.update(guestTable.name, guestTable.columns.guestID, id, ["deleted"], [true]);
                if (!deleted) {
                    throw new Error("Guest not found");
                }
                return deleted
            })

            res.status(200).json({
                success: true,
                msg: "Delete successfully",
                data: result
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    },

    getAll: async (req, res) => {
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
                return handleError(res, 404, new Error("Guest not found"));
            }

            return res.status(200).json({
                success: true,
                guests: guests
            })
        } catch (error) {
            return handleError(res, 500, error);
        }
    }

}

module.exports = guestController;
