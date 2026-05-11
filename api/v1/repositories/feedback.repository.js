const baseModel = require("../../../model/base.model");
const feedbackTable = require("../../../model/table/feedback.table");
const bookingTable = require("../../../model/table/booking.table");
const customerTable = require("../../../model/table/customer.table");

class FeedbackRepository {
    async findById(feedbackID) {
        return await baseModel.findByField(feedbackTable.name, feedbackTable.columns.feedbackID, feedbackID);
    }

    async findAll(limit, offset) {
        return await baseModel.findWithConditions(feedbackTable.name, undefined, [], [], [], limit, offset);
    }

    async create(columns, values) {
        return await baseModel.create(feedbackTable.name, columns, values);
    }

    async update(feedbackID, columns, values) {
        return await baseModel.update(feedbackTable.name, feedbackTable.columns.feedbackID, feedbackID, columns, values);
    }

    async delete(feedbackID) {
        return await baseModel.update(feedbackTable.name, feedbackTable.columns.feedbackID, feedbackID, ["deleted"], [true]);
    }

    async findBookingById(bookingID) {
        return await baseModel.findByField(bookingTable.name, bookingTable.columns.bookingID, bookingID);
    }

    async findCustomerById(customerID) {
        return await baseModel.findByField(customerTable.name, customerTable.columns.customerID, customerID);
    }

    async transaction(callback) {
        return await baseModel.executeTransaction(callback);
    }
}

module.exports = new FeedbackRepository();