const baseModel = require("../../../model/base.model")
const bookingTable = require("../../../model/table/booking.table");
const detailTable = require("../../../model/table/bookingDetail.table");
const customerTable = require("../../../model/table/customer.table");
const userTable = require("../../../model/table/user.table");
const stylistWorkShiftTable = require("../../../model/table/stylistWorkshift.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");
const e = require("express");


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

                const stylistWorkShiftID = req.body.stylistWorkShiftID;
                const updateWorkshift = await baseModel.update(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, stylistWorkShiftID, ["status"], ["Inactive"])

                return { newBooking: newBooking, newDetails: newDetails, updateWorkshift: updateWorkshift }
            });

            return res.status(200).json({
                success: true,
                newBooking: result.newBooking,
                newDetails: result.newDetails,
                updateWorkshift: result.updateWorkshift
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
        try {
            const id = req.query.bookingID;

            const booking = await baseModel.findWithConditionsJoin(
                bookingTable.name, // Booking
                ['"Booking".*', '"Users"."phoneNumber"', '"Customer"."fullName"'], 
                [  { column: 'bookingID', value: id, operator: '=' }],
                [],
                [ // Joins
                    {
                        table: customerTable.name,
                        on: `"${customerTable.name}"."${customerTable.columns.customerID}" = "${bookingTable.name}"."${bookingTable.columns.customerID}"`,
                        type: 'INNER'
                    }, // Join table customer
                    {
                        table: userTable.name,
                        on: `"${customerTable.name}"."${customerTable.columns.userID}" = "${userTable.name}"."${userTable.columns.userID}"`,
                        type: 'INNER'
                    } // Join table user
                ],
                [],
                undefined, 
                undefined 
            )
            if (!booking) {
                return res.status(400).json({
                    success: false,
                    msg: "Booking not found"
                })
            }

            const details = await baseModel.findAllByField(detailTable.name, "bookingID", id);
            if (!details) {
                return res.status(400).json({
                    success: false,
                    msg: "Booking not found"
                })
            }


            return res.status(200).json({
                success: true,
                booking: booking,
                details: details
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    getAll: async (req, res) => {
        try {
            const limit = Math.abs(parseInt(req.query.perpage)) || 10;
            const page = Math.abs(parseInt(req.query.page)) || 1;
            const offset = (page - 1) * limit;

            const bookings = await baseModel.findWithConditionsJoin(
                bookingTable.name, // Booking
                ['"Booking".*', '"Users"."phoneNumber"'], 
                [],
                [],
                [ // Joins
                    {
                        table: customerTable.name,
                        on: `"${customerTable.name}"."${customerTable.columns.customerID}" = "${bookingTable.name}"."${bookingTable.columns.customerID}"`,
                        type: 'INNER'
                    }, // Join table customer
                    {
                        table: userTable.name,
                        on: `"${customerTable.name}"."${customerTable.columns.userID}" = "${userTable.name}"."${userTable.columns.userID}"`,
                        type: 'INNER'
                    } // Join table user
                ],
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
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    update: async (req, res) => {
        try {
            const result = await baseModel.executeTransaction(async () => {
                const id = req.body.bookingID;
                // Get old data of booking

                const oldBooking = await baseModel.findByField(bookingTable.name, bookingTable.columns.bookingID, id);

                const { columns: columnsBooking, values: valuesBooking } = getColsVals(bookingTable, req.body);

                // Update booking
                const updateBooking = await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, id, columnsBooking, valuesBooking);

                // Delete selected services
                await baseModel.deleteById(detailTable.name, detailTable.columns.bookingID, id);
                // Add new data of services
                const newDetails = []; // Initialize an empty array

                for (const serviceID of req.body.serviceID) {
                    req.body.serviceID = serviceID;  // Update serviceID through each loop
                    const { columns: newColumnsDetail, values: newValuesDetail } = getColsVals(detailTable, req.body);

                    // Sử dụng await để đợi cho từng thao tác hoàn tất
                    const result = await baseModel.create(detailTable.name, newColumnsDetail, newValuesDetail);
                    newDetails.push(result); // push result into newDetails
                }
                // new stylistWorkShift
                const newStylistWorkShiftID = req.body.stylistWorkShiftID;
                const newStylistWorkshift = await baseModel.findByField(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, newStylistWorkShiftID);
                if (newStylistWorkshift.status === "Inactive") {
                    throw new Error("Already booked");
                }
                // Assign old data
                let newWorkshift = await baseModel.findByField(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, oldBooking.stylistWorkShiftID);
                if (newStylistWorkShiftID !== oldBooking.stylistWorkShiftID) {
                    // Update the status of the old workshift
                    await baseModel.update(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, oldBooking.stylistWorkShiftID, ["status"], ["Active"]);
                    await baseModel.update(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, newStylistWorkShiftID, ["status"], ["Inactive"]);
                    // Assign new data if there is a change
                    newWorkshift = await baseModel.findByField(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, newStylistWorkShiftID);
                }
                // Return value
                return { newBooking: updateBooking, newDetails: newDetails, updateWorkshift: newWorkshift }
            })

            return res.status(200).json({
                success: true,
                updateBooking: result.newBooking,
                newDetails: result.newDetails,
                updateWorkshift: result.updateWorkshift
            })

        } catch (error) {
            if (error.message === "Already booked") {
                return res.status(403).json({
                    success: false,
                    msg: error.message
                });
            }
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    }
}

module.exports = bookingController;























