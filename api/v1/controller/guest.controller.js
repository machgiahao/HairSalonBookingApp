const baseModel = require("../../../model/base.model");
const guestTable = require("../../../model/table/guest.table");
const { getColsVals } = require("../../../helper/getColsVals.helper"); 

const guestController = {
    create: async (req, res) => {
        try {
            const result = await baseModel.executeTransaction(async () => {
                const {columns, values} = getColsVals(guestTable, req.body);
                const guest = await baseModel.create(guestTable.name, columns, values);
                return {guest: guest};
            })
            return res.status(200).json({
                success: true,
                guest: result.guest
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }


    }
}

module.exports = guestController;
