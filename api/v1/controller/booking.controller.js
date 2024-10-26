const baseModel = require("../../../model/base.model")
const bookingTable = require("../../../model/table/booking.table");
const detailTable = require("../../../model/table/bookingDetail.table");
const customerTable = require("../../../model/table/customer.table");
const userTable = require("../../../model/table/user.table");
const stylistWorkShiftTable = require("../../../model/table/stylistWorkshift.table");
const workShiftTable = require("../../../model/table/workshift.table");
const dateRefactor = require("..//../../helper/dateRefactor.helper");
const { getColsVals } = require("../../../helper/getColsVals.helper");



const bookingController = {
    create: async (req, res) => {
        try {
            const result = await baseModel.executeTransaction(async () => {
                const stylistWorkShiftID = req.body.stylistWorkShiftID;
                // Update stylist's schedule to inactive
                const updateStylistWorkshift = await baseModel.update(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, stylistWorkShiftID, ["status"], ["Inactive"])
                // Get workshift
                const workShift = await baseModel.findByField(workShiftTable.name, workShiftTable.columns.workShiftID, updateStylistWorkshift.workShiftID);
                // Get day and date object to use
                const currentDate = dateRefactor.getWeekdayAndDate();
                // Handle date to save into db
                if (currentDate.weekday === workShift.shiftDay) {
                    // if it matches current, set current date for appointmentAt
                    req.body.appointmentAt = dateRefactor.addDaysAndFormat(currentDate.date, 0);
                } else {
                    // if it matches current, set next date for appointmentAt
                    req.body.appointmentAt = dateRefactor.addDaysAndFormat(currentDate.date, 1);
                }
                // Default when customer booking is in-progress
                req.body.status = req.body.status ?? "In-progress";
                const { columns, values } = getColsVals(bookingTable, req.body);
                // Create query to create booking
                const newBooking = await baseModel.create(bookingTable.name, columns, values);

                // Reassign to let bookingDetail can get
                req.body.bookingID = newBooking.bookingID;

                const newDetails = []; // Initialize an empty array to contains record of services
                for (const serviceID of req.body.serviceID) {
                    req.body.serviceID = serviceID;  // Update serviceID through each loop
                    const { columns: columnsDetail, values: valuesDetail } = getColsVals(detailTable, req.body);

                    // Create booking detail for each service
                    const result = await baseModel.create(detailTable.name, columnsDetail, valuesDetail);
                    newDetails.push(result); // push result into newDetails
                }
                return { newBooking: newBooking, newDetails: newDetails, updateStylistWorkshift: updateStylistWorkshift }
            });

            return res.status(200).json({
                success: true,
                newBooking: result.newBooking,
                newDetails: result.newDetails,
                updateWorkshift: result.updateStylistWorkshift
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
                [{ column: 'bookingID', value: id, operator: '=' }],
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
                throw new Error("No booking found")
            }

            return res.status(200).json({
                success: true,
                bookings: bookings
            })
        } catch (error) {
            console.log(error)
            if (error.message === "No booking found") {
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
    },

    update: async (req, res) => {
        try {
            const result = await baseModel.executeTransaction(async () => {
                const id = req.body.bookingID;
                // Get old data of booking
                const oldBooking = await baseModel.findByField(bookingTable.name, bookingTable.columns.bookingID, id);

                // Delete selected services
                await baseModel.deleteById(detailTable.name, detailTable.columns.bookingID, id);
                // Add new data of services
                const newDetails = []; // Initialize an empty array

                for (const serviceID of req.body.serviceID) {
                    req.body.serviceID = serviceID;  // Update serviceID through each loop
                    const { columns: newColumnsDetail, values: newValuesDetail } = getColsVals(detailTable, req.body);

                    const result = await baseModel.create(detailTable.name, newColumnsDetail, newValuesDetail);
                    newDetails.push(result); // push result into newDetails
                }
                // new stylistWorkShift
                const newStylistWorkShiftID = req.body.stylistWorkShiftID;

                // Assign old data
                let newWorkshift = await baseModel.findByField(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, oldBooking.stylistWorkShiftID);
                // If has change in stylist then the change will be made
                if (newStylistWorkShiftID !== oldBooking.stylistWorkShiftID) {
                    const newStylistWorkshift = await baseModel.findByField(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, newStylistWorkShiftID);

                    if (newStylistWorkshift.status === "Inactive") {
                        throw new Error("Already booked");
                    }
                    if (newStylistWorkShiftID !== oldBooking.stylistWorkShiftID) {
                        // Update the status of the old workshift
                        await baseModel.update(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, oldBooking.stylistWorkShiftID, ["status"], ["Active"]);
                        const updateStylistWorkshift = await baseModel.update(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, newStylistWorkShiftID, ["status"], ["Inactive"]);
                        // Get workshift
                        const workShift = await baseModel.findByField(workShiftTable.name, workShiftTable.columns.workShiftID, updateStylistWorkshift.workShiftID);
                        // Get day and date object to use
                        const currentDate = dateRefactor.getWeekdayAndDate();
                        // Handle date to save into db

                        if (currentDate.weekday === workShift.shiftDay) {
                            // if it matches current, set current date for appointmentAt
                            req.body.appointmentAt = dateRefactor.addDaysAndFormat(currentDate.date, 0);
                        } else {
                            // if it matches current, set next date for appointmentAt
                            req.body.appointmentAt = dateRefactor.addDaysAndFormat(currentDate.date, 1);
                        }
                        // Assign new data if there is a change
                        newWorkshift = await baseModel.findByField(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, newStylistWorkShiftID);
                    }
                }

                const { columns: columnsBooking, values: valuesBooking } = getColsVals(bookingTable, req.body);
                const updateBooking = await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, id, columnsBooking, valuesBooking);
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
            console.log(error);

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
    },

    changeStatus: async (req, res) => {
        try {
            const id = req.body.bookingID;
            console.log(id);
            const status = req.body.status;
            const result = await baseModel.executeTransaction(async () => {
                const recordBooking = await baseModel.findByField(bookingTable.name, bookingTable.columns.bookingID, id);
                if (recordBooking.status === "Completed" || recordBooking.status === "Cancelled") {
                    throw new Error("Cannot Update");
                }

                let booking = null;
                let customer = null;
                let stylistWorkShift = null;

                switch (status) {
                    case "Completed":
                        booking = await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, id, ["status"], ["Completed"]);
                        if (booking.customerID != null) {
                            const point = booking.discountPrice * 0.01;
                            const recordCustomer = await baseModel.findByField(customerTable.name, customerTable.columns.customerID, booking.customerID);
                            const loyalPoint = recordCustomer.loyaltyPoints + point;
                            customer = await baseModel.update(customerTable.name, customerTable.columns.customerID, booking.customerID, [`${customerTable.columns.loyaltyPoints}`], [`${loyalPoint}`]);
                        }
                        break;
                    case "Cancelled":
                        booking = await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, id, ["status"], ["Cancelled"]);
                        stylistWorkShift = await baseModel.update(stylistWorkShiftTable.name, stylistWorkShift.columns.stylistWorkShiftID, booking.stylistWorkShiftID, ["status"], ["Active"]);
                        break;
                    default:
                        break;
                }
                return { booking: booking, customer: customer, stylistWorkShift: stylistWorkShift }
            })
            return res.status(201).json({
                success: true,
                data: {
                    booking: result.booking,
                    customer: result.customer,
                    stylistWorkShift: result.stylistWorkShift
                }
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: `${error.message}`
            })
        }

    },

    delete: async (req, res) => {
        try {
            const bookingID = req.query.bookingID;

            const result = await baseModel.executeTransaction(async () => {
                const deleted = await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, bookingID, ["deleted"], [true]);
                if (!deleted) {
                    throw new Error("Booking not exist")
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
            if (error.message === "Booking not exist") {
                return res.status(404).json({
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