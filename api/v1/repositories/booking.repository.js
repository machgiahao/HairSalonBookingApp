const baseModel = require("../../../model/base.model");
const bookingTable = require("../../../model/table/booking.table");
const detailTable = require("../../../model/table/bookingDetail.table");
const customerTable = require("../../../model/table/customer.table");
const stylistWorkShiftTable = require("../../../model/table/stylistWorkshift.table");
const workShiftTable = require("../../../model/table/workshift.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");

class BookingRepository {
    async createBooking(columns, values) {
        return await baseModel.create(bookingTable.name, columns, values);
    }

    async findBookingById(bookingID) {
        return await baseModel.findByField(bookingTable.name, bookingTable.columns.bookingID, bookingID);
    }

    async findAllBookings(limit, offset, order) {
        const findBookingDetail = require("../../../helper/findBookingDetails.helper");
        return await findBookingDetail.findAllJoins(limit, offset, order);
    }

    async findBookingWithConditions(conditions, logicalOperator, limit, offset) {
        return await baseModel.findWithConditionsJoin(
            bookingTable.name,
            [`DISTINCT "${bookingTable.name}".*`],
            conditions,
            logicalOperator,
            [],
            [],
            limit,
            offset
        );
    }

    async updateBooking(bookingID, columns, values) {
        return await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, bookingID, columns, values);
    }

    async updateBookingStatus(bookingID, status) {
        return await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, bookingID, ["status"], [status]);
    }

    async deleteBooking(bookingID) {
        return await baseModel.executeTransaction(async () => {
            await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, bookingID, ["status"], ["Cancelled"]);
            return await baseModel.update(bookingTable.name, bookingTable.columns.bookingID, bookingID, ["deleted"], [true]);
        });
    }

    async createBookingDetail(columns, values) {
        return await baseModel.create(detailTable.name, columns, values);
    }

    async deleteBookingDetails(bookingID) {
        return await baseModel.deleteById(detailTable.name, detailTable.columns.bookingID, bookingID);
    }

    async findBookingDetails(bookingID) {
        return await baseModel.findAllByField(detailTable.name, detailTable.columns.bookingID, bookingID);
    }

    async findStylistWorkShift(stylistWorkShiftID) {
        return await baseModel.findByField(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, stylistWorkShiftID);
    }

    async updateStylistWorkShiftStatus(stylistWorkShiftID, status) {
        return await baseModel.update(stylistWorkShiftTable.name, stylistWorkShiftTable.columns.stylistWorkShiftID, stylistWorkShiftID, ["status"], [status]);
    }

    async findWorkShift(workShiftID) {
        return await baseModel.findByField(workShiftTable.name, workShiftTable.columns.workShiftID, workShiftID);
    }

    async findCustomer(customerID) {
        return await baseModel.findByField(customerTable.name, customerTable.columns.customerID, customerID);
    }

    async updateCustomerLoyaltyPoints(customerID, points) {
        return await baseModel.update(customerTable.name, customerTable.columns.customerID, customerID, [`${customerTable.columns.loyaltyPoints}`], [`${points}`]);
    }

    async transaction(callback) {
        return await baseModel.executeTransaction(callback);
    }
}

module.exports = new BookingRepository();