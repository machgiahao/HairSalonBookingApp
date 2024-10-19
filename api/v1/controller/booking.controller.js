const baseModel = require("../../../model/base.model")
const bookingTable = require("../../../model/table/booking.table");
const detailTable = require("../../../model/table/bookingDetail.table");
const stylistWorkShiftTable = require("../../../model/table/stylistWorkshift.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");

const bookingController = {
    create: async (req, res) => {
        try {
            const result = await baseModel.executeTransaction(async () => {
                req.body.status = req.body.status ?? "In-progress";
                const { columns, values } = getColsVals(bookingTable, req.body);
                // Create query to create booking
                const newBooking = await baseModel.create(bookingTable.name, columns, values);

                // Reassign to let bookingDetail can get
                req.body.bookingID = newBooking.bookingID;

                const newDetails = []; // Initialize an empty array

                for (const serviceID of req.body.serviceID) {
                    req.body.serviceID = serviceID;  // Update serviceID through each loop
                    const { columns: columnsDetail, values: valuesDetail } = getColsVals(detailTable, req.body);

                    // Sử dụng await để đợi cho từng thao tác hoàn tất
                    const result = await baseModel.create(detailTable.name, columnsDetail, valuesDetail);
                    newDetails.push(result); // push result into newDetails
                }

                const updateWorkshift = await baseModel.update(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistID, newBooking.stylistID, ["status"], ["Inactive"])

                return { newBooking: newBooking, newDetails: newDetails, updateWorkshift: updateWorkshift }
            });

            return res.status(200).json({
                success: true,
                newBooking: result.newBooking,
                newDetails: result.newDetails,
                updateWorkshift: result.updateWorkshift
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    detail: async (req, res) => {
        try {
            const id = req.query.bookingID;

            const booking = await baseModel.findByField(bookingTable.name, "bookingID", id);
            if (!booking) {
                return res.status(400).json({
                    success: false,
                    msg: "Booking not found"
                })
            }

            return res.status(200).json({
                success: true,
                booking: booking
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    getAll: async (req, res) => {
        try {
            const limit = Math.abs(parseInt(req.query.perpage)) || 10;
            const offset = Math.abs(parseInt(req.query.page)) || 0;

            const bookings = await baseModel.findWithConditions(
                bookingTable.name,
                undefined,
                [],
                [],
                [],
                limit,
                offset
            )

            if (!bookings || bookings.length === 0) {
                return res.status(404).json({
                    success: false,
                    msg: "No booking found"
                })
            }

            return res.status(200).json({
                success: true,
                bookings: bookings
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    }
}

module.exports = bookingController;























