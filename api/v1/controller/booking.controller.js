const baseModel = require("../../../model/base.model");
const bookingTable = require("../../../model/table/booking.table");
const detailTable = require("../../../model/table/bookingDetail.table")
const { getColsVals } = require("../../../helper/getColsVals.helper");

const bookingController = {
    create: async (req, res) => {
        try {
            req.body.status = req.body.status ?? "Confirmed";
            const { columns, values } = getColsVals(bookingTable, req.body);

            // Create booking
            const newBooking = await baseModel.create(bookingTable.name, columns, values);

            // Reassign to let bookingDetail can get
            req.body.bookingID = newBooking.bookingID;
            const { columns: columnsDetail, values: valuesDetail } = getColsVals(detailTable, req.body);
            // Create detail
            const newDetail = await baseModel.create(detailTable.name, columnsDetail, valuesDetail);
            return res.status(200).json({
                success: true,
                newBooking: newBooking,
                newDetail: newDetail
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    }, 

    detail: async (req, res) => {
        const id = req.query.id;

        const booking = await baseModel.findByField(bookingTable.name, "bookingID", id);
        if (!booking) {
            return res.status(400).json({
                success: false,
                msg: "Booking not found"
            })
        }

    }
}

module.exports = bookingController;























