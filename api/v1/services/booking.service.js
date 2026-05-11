const { getColsVals } = require("../../../helper/getColsVals.helper");
const dateRefactor = require("../../../helper/dateRefactor.helper");
const findBookingDetail = require("../../../helper/findBookingDetails.helper");
const bookingTable = require("../../../model/table/booking.table");
const detailTable = require("../../../model/table/bookingDetail.table");
const stylistWorkShiftTable = require("../../../model/table/stylistWorkshift.table");
const workShiftTable = require("../../../model/table/workshift.table");
const customerTable = require("../../../model/table/customer.table");
const bookingRepository = require("../repositories/booking.repository");
const isValidId = require("../../../validates/reqIdParam.validate");

class BookingService {
    async create(data) {
        this.validateBookingData(data);

        const result = await bookingRepository.transaction(async () => {
            const stylistWorkShiftID = data.stylistWorkShiftID;

            const updateStylistWorkshift = await bookingRepository.updateStylistWorkShiftStatus(stylistWorkShiftID, "Inactive");

            const workShift = await bookingRepository.findWorkShift(updateStylistWorkshift.workShiftID);
            const currentDate = dateRefactor.getWeekdayAndDate();

            let appointmentAt;
            if (currentDate.weekday === workShift.shiftDay) {
                appointmentAt = dateRefactor.addDaysAndFormat(currentDate.date, 0);
            } else {
                appointmentAt = dateRefactor.addDaysAndFormat(currentDate.date, 1);
            }

            const bookingData = {
                ...data,
                appointmentAt,
                status: data.status ?? "In-progress",
                discountPrice: data.originalPrice
            };

            const { columns, values } = getColsVals(bookingTable, bookingData);
            const newBooking = await bookingRepository.createBooking(columns, values);

            if (!newBooking) {
                throw { statusCode: 400, message: "Cannot create booking" };
            }

            if (!data.serviceID || data.serviceID.length === 0) {
                throw { statusCode: 400, message: "Cannot create booking without service ID" };
            }

            const newDetails = [];
            for (const serviceID of data.serviceID) {
                const detailData = { ...data, serviceID, bookingID: newBooking.bookingID };
                const { columns: columnsDetail, values: valuesDetail } = getColsVals(detailTable, detailData);
                const result = await bookingRepository.createBookingDetail(columnsDetail, valuesDetail);
                newDetails.push(result);
            }

            return { newBooking, newDetails, updateStylistWorkshift };
        });

        return result;
    }

    async getDetail(bookingID) {
        if (!isValidId(bookingID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const booking = await bookingRepository.findBookingById(bookingID);
        if (!booking) {
            throw { statusCode: 404, message: "Booking not found" };
        }

        const result = await findBookingDetail.findDetailJoins(booking);
        const details = await bookingRepository.findBookingDetails(bookingID);

        return { booking: result, details };
    }

    async getAll(query) {
        const limit = Math.abs(parseInt(query.perpage)) || null;
        const page = Math.abs(parseInt(query.page)) || 1;
        const offset = (page - 1) * limit;
        const order = { column: `"${bookingTable.name}"."${bookingTable.columns.bookingID}"`, direction: "DESC" };

        const bookings = await bookingRepository.findAllBookings(limit, offset, order);

        if (!bookings || bookings.length === 0) {
            throw { statusCode: 404, message: "No booking found" };
        }

        return { bookings };
    }

    async update(bookingID, data) {
        if (!isValidId(bookingID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const oldBooking = await bookingRepository.findBookingById(bookingID);
        if (!oldBooking) {
            throw { statusCode: 404, message: "Booking not found" };
        }

        const result = await bookingRepository.transaction(async () => {
            await bookingRepository.deleteBookingDetails(bookingID);

            const newDetails = [];
            for (const serviceID of data.serviceID) {
                const detailData = { ...data, serviceID, bookingID };
                const { columns: newColumnsDetail, values: newValuesDetail } = getColsVals(detailTable, detailData);
                const result = await bookingRepository.createBookingDetail(newColumnsDetail, newValuesDetail);
                newDetails.push(result);
            }

            const newStylistWorkShiftID = data.stylistWorkShiftID;
            let newWorkshift = await bookingRepository.findStylistWorkShift(oldBooking.stylistWorkShiftID);

            if (newStylistWorkShiftID !== oldBooking.stylistWorkShiftID) {
                const newStylistWorkshift = await bookingRepository.findStylistWorkShift(newStylistWorkShiftID);

                if (newStylistWorkshift.status === "Inactive") {
                    throw { statusCode: 409, message: "Already booked" };
                }

                await bookingRepository.updateStylistWorkShiftStatus(oldBooking.stylistWorkShiftID, "Active");
                const updateStylistWorkshift = await bookingRepository.updateStylistWorkShiftStatus(newStylistWorkShiftID, "Inactive");

                const workShift = await bookingRepository.findWorkShift(updateStylistWorkshift.workShiftID);
                const currentDate = dateRefactor.getWeekdayAndDate();

                if (currentDate.weekday === workShift.shiftDay) {
                    data.appointmentAt = dateRefactor.addDaysAndFormat(currentDate.date, 0);
                } else {
                    data.appointmentAt = dateRefactor.addDaysAndFormat(currentDate.date, 1);
                }

                newWorkshift = await bookingRepository.findStylistWorkShift(newStylistWorkShiftID);
            }

            const { columns: columnsBooking, values: valuesBooking } = getColsVals(bookingTable, data);
            const updateBooking = await bookingRepository.updateBooking(bookingID, columnsBooking, valuesBooking);

            return { newBooking: updateBooking, newDetails, updateWorkshift: newWorkshift };
        });

        return result;
    }

    async changeStatus(bookingID, status) {
        if (!isValidId(bookingID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const result = await bookingRepository.transaction(async () => {
            const recordBooking = await bookingRepository.findBookingById(bookingID);

            if (recordBooking.status === "Completed" || recordBooking.status === "Cancelled") {
                throw { statusCode: 400, message: "Cannot update status" };
            }

            let booking = null;
            let customer = null;
            let stylistWorkShift = null;

            switch (status) {
                case "Done":
                    booking = await bookingRepository.updateBookingStatus(bookingID, "Done");
                    if (!booking) throw { statusCode: 404, message: "Update booking failed" };
                    break;

                case "Completed":
                    booking = await bookingRepository.updateBookingStatus(bookingID, "Completed");
                    if (!booking) throw { statusCode: 404, message: "Update booking failed" };

                    if (booking.customerID != null) {
                        const point = booking.discountPrice * process.env.RATIO_LOYAL_POINT;
                        const recordCustomer = await bookingRepository.findCustomer(booking.customerID);
                        const loyalPoint = recordCustomer.loyaltyPoints + point;
                        customer = await bookingRepository.updateCustomerLoyaltyPoints(booking.customerID, loyalPoint);
                    }
                    break;

                case "Cancelled":
                    booking = await bookingRepository.updateBookingStatus(bookingID, "Cancelled");
                    if (!booking) throw { statusCode: 404, message: "Update booking failed" };

                    stylistWorkShift = await bookingRepository.updateStylistWorkShiftStatus(booking.stylistWorkShiftID, "Active");
                    if (!stylistWorkShift) throw { statusCode: 404, message: "Update stylist workshift failed" };
                    break;

                default:
                    throw { statusCode: 400, message: "Invalid status format" };
            }

            return { booking, customer, stylistWorkShift };
        });

        return result;
    }

    async delete(bookingID) {
        if (!isValidId(bookingID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const result = await bookingRepository.deleteBooking(bookingID);
        if (!result) {
            throw { statusCode: 404, message: "Booking not exist" };
        }

        return { data: result };
    }

    async getHistory(customerID, query) {
        if (!isValidId(customerID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const limit = Math.abs(parseInt(query.perpage)) || null;
        const offset = (Math.abs(parseInt(query.page) || 1) - 1) * limit;

        const conditions = [
            { column: bookingTable.columns.status, value: "Completed", operator: '=' },
            { column: bookingTable.columns.customerID, value: customerID, operator: '=' }
        ];

        const bookings = await bookingRepository.findBookingWithConditions(conditions, ["AND"], limit, offset);
        return { data: bookings };
    }

    validateBookingData(data) {
        if (!data.stylistWorkShiftID) {
            throw { statusCode: 400, message: "Stylist work shift ID is required" };
        }
    }
}

module.exports = new BookingService();