const baseModel = require("../../../model/base.model");
const paymentTable = require("../../../model/table/payment.table");

class PaymentRepository {
    async findAll() {
        return await baseModel.find("Payment");
    }

    async findById(paymentID) {
        return await baseModel.findById("Payment", "paymentID", paymentID);
    }

    async findByBookingId(bookingID) {
        return await baseModel.findAllByField("Payment", "bookingID", bookingID);
    }

    async create(columns, values) {
        return await baseModel.create("Payment", columns, values);
    }

    async update(paymentID, columns, values) {
        return await baseModel.update(paymentTable.name, paymentTable.columns.paymentID, paymentID, columns, values);
    }

    async softDelete(paymentID) {
        return await baseModel.update("Payment", "paymentID", paymentID, ["deleted"], [true]);
    }

    async findBookingById(bookingID) {
        return await baseModel.findById("Booking", "bookingID", bookingID);
    }
}

module.exports = new PaymentRepository();