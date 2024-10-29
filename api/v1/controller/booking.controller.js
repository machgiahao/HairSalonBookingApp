const baseModel = require("../../../model/base.model")
const bookingTable = require("../../../model/table/booking.table");
const detailTable = require("../../../model/table/bookingDetail.table");
const customerTable = require("../../../model/table/customer.table");
const userTable = require("../../../model/table/user.table");
const stylistWorkShiftTable = require("../../../model/table/stylistWorkshift.table");
const workShiftTable = require("../../../model/table/workshift.table");
const dateRefactor = require("..//../../helper/dateRefactor.helper");
const { getColsVals } = require("../../../helper/getColsVals.helper");
const findBookingDetail = require("../../../helper/findBookingDetails.helper");
const handlError = require("../../../helper/handleError.helper");
const handlResponse = require("../../../helper/handleReponse.helper");
const isValidId = require("../../../validates/reqIdParam.validate");
const handleResponse = require("../../../helper/handleReponse.helper");


const bookingController = {
    create: async (req, res) => {
        let statusCode
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
                req.body.discountPrice = req.body.originalPrice;
                const { columns, values } = getColsVals(bookingTable, req.body);
                // Create query to create booking
                const newBooking = await baseModel.create(bookingTable.name, columns, values);
                if (!newBooking) {
                    statusCode = 400
                    throw new Error("Cannot create booking");
                }


                // Reassign to let bookingDetail can get
                req.body.bookingID = newBooking.bookingID;

                const newDetails = []; // Initialize an empty array to contains record of services
                for (const serviceID of req.body.serviceID) {
                    req.body.serviceID = serviceID;  // Update serviceID through each loop
                    const { columns: columnsDetail, values: valuesDetail } = getColsVals(detailTable, req.body);

                    // Create booking detail for each service
                    const result = await baseModel.create(detailTable.name, columnsDetail, valuesDetail);
                    if (!result) {
                        statusCode = 400
                        throw new Error("Cannot create detail booking");
                    }
                    newDetails.push(result); // push result into newDetails
                }
                return { newBooking: newBooking, newDetails: newDetails, updateStylistWorkshift: updateStylistWorkshift }
            });

            return handlResponse(res, 201, {
                newBooking: result.newBooking,
                newDetails: result.newDetails,
                updateWorkshift: result.updateStylistWorkshift
            })
        } catch (error) {
            return handlError(res, statusCode, error);
        }
    },

    detail: async (req, res) => {
        let statusCode
        try {
            const id = req.query.bookingID;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const booking = await baseModel.findByField(bookingTable.name, bookingTable.columns.bookingID, id);
            const result = await findBookingDetail.findDetailJoins(booking);
            if (!result) {
                statusCode = 404
                throw new Error("Booking not found");
            }

            const details = await baseModel.findAllByField(detailTable.name, detailTable.columns.bookingID, id);
            if (!details) {
                statusCode = 404
                throw new Error("Booking detail not found");
            }

            return handlResponse(res, 201, {
                success: true,
                booking: result,
                details: details
            })
        } catch (error) {
            return handlError(res, statusCode, error);
        }
    },

    getAll: async (req, res) => {
        let statusCode
        try {
            const limit = Math.abs(parseInt(req.query.perpage)) || null;
            const page = Math.abs(parseInt(req.query.page)) || 1;
            const offset = (page - 1) * limit;
            const order = { column: `${bookingTable.name}"."${bookingTable.columns.bookingID}`, direction: "DESC" }
            const bookings = await findBookingDetail.findAllJoins(limit, offset, order)

            if (!bookings || bookings.length === 0) {
                statusCode = 404
                throw new Error("No booking found")
            }

            return handlResponse(res, 200, { bookings: bookings });
        } catch (error) {
            return handlError(res, statusCode, error);
        }
    },

    update: async (req, res) => {
        let statusCode
        try {
            const result = await baseModel.executeTransaction(async () => {
                const id = req.body.bookingID;
                if (!isValidId(id)) {
                    statusCode = 400
                    throw new Error("Invalid ID");
                }
                // Get old data of booking
                const oldBooking = await baseModel.findByField(bookingTable.name, bookingTable.columns.bookingID, id);
                if (!oldBooking) {
                    statusCode = 404
                    throw new Error("Booking not found");
                }
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
                        statusCode = 409
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

            return handlResponse(res, 200, {
                updateBooking: result.newBooking,
                newDetails: result.newDetails,
                updateWorkshift: result.updateWorkshift
            });
        } catch (error) {
            return handlError(res, statusCode, error);
        }
    },

    changeStatus: async (req, res) => {
        let statusCode
        try {
            const id = req.body.bookingID;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const status = req.body.status;
            const result = await baseModel.executeTransaction(async () => {
                const recordBooking = await baseModel.findByField(bookingTable.name, bookingTable.columns.bookingID, id);
                if (recordBooking.status === "Completed" || recordBooking.status === "Cancelled") {
                    statusCode = 400
                    throw new Error("Cannot Update Status");
                }

                let booking = null;
                let customer = null;
                let stylistWorkShift = null;

                switch (status) {
                    case "Done":
                        booking = await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, id, ["status"], ["Done"]);
                        if (!booking) {
                            statusCode = 404
                            throw new Error("Update booking fail");
                        }
                        break;
                    case "Completed":
                        booking = await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, id, ["status"], ["Completed"]);
                        if (!booking) {
                            statusCode = 404
                            throw new Error("Update booking fail");
                        }
                        if (booking.customerID != null) {
                            const point = booking.discountPrice * 0.01;
                            const recordCustomer = await baseModel.findByField(customerTable.name, customerTable.columns.customerID, booking.customerID);
                            const loyalPoint = recordCustomer.loyaltyPoints + point;
                            customer = await baseModel.update(customerTable.name, customerTable.columns.customerID, booking.customerID, [`${customerTable.columns.loyaltyPoints}`], [`${loyalPoint}`]);
                        }
                        break;
                    case "Cancelled":
                        booking = await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, id, ["status"], ["Cancelled"]);
                        if (!booking) {
                            statusCode = 404
                            throw new Error("Update booking fail");
                        }
                        // Active workshift
                        stylistWorkShift = await baseModel.update(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, booking.stylistWorkShiftID, ["status"], ["Active"]);

                        if (!stylistWorkShift) {
                            statusCode = 404
                            throw new Error("Update stylist workshift fail");
                        }
                        break;
                    default:
                        throw new Error("Invalid format status");
                }
                return { booking: booking, customer: customer, stylistWorkShift: stylistWorkShift }
            })

            return handlResponse(res, 200, {
                data: {
                    booking: result.booking,
                    customer: result.customer,
                    stylistWorkShift: result.stylistWorkShift
                }
            })
        } catch (error) {
            return handlError(res, statusCode, error);
        }

    },

    delete: async (req, res) => {
        let statusCode
        try {
            const bookingID = req.query.bookingID;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }

            const result = await baseModel.executeTransaction(async () => {
                await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, bookingID, ["status"], ["Cancelled"]);
                const deleted = await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, bookingID, ["deleted"], [true]);
                if (!deleted) {
                    statusCode = 404
                    throw new Error("Booking not exist")
                }
                return deleted
            })

            return handleResponse(res, 200, { data: result })
        } catch (error) {
            return handlError(res, statusCode, error);
        }

    },

    history: async (req, res) => {
        let statusCode
        try {
            const customerID = req.query.id;
            if (!isValidId(customerID)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }

            const limit = Math.abs(parseInt(req.query.perpage)) || null;
            const offset = (Math.abs(parseInt(req.query.page) || 1) - 1) * limit;
            const conditions = [
                { column: bookingTable.columns.status, value: "Completed", operator: '=' },
                { column: bookingTable.columns.customerID, value: customerID, operator: '=' }
            ];
            const logicalOperator = ["AND"];
            const bookings = await baseModel.findWithConditionsJoin(
                bookingTable.name, // Booking
                [`DISTINCT "${bookingTable.name}".*`],
                conditions,
                logicalOperator,
                [],
                [],
                limit,
                offset
            )
            return handleResponse(res, 200, { data: bookings })
        } catch (error) {
            return handlError(res, statusCode, error);s
        }
    }
}

module.exports = bookingController;