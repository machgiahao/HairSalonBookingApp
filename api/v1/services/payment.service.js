const paymentTable = require("../../../model/table/payment.table");
const paymentRepository = require("../repositories/payment.repository");
const vietQRConfig = require("../../../config/vietQR.config");

class PaymentService {
    async getAll() {
        const paymentList = await paymentRepository.findAll();

        if (!paymentList || paymentList.length === 0) {
            throw { statusCode: 404, message: "No payment found" };
        }

        const paymentDetailsWithTotalPrice = await Promise.all(
            paymentList.map(async (paymentDetail) => {
                const bookingInfo = await paymentRepository.findBookingById(paymentDetail.bookingID);
                return {
                    ...paymentDetail,
                    totalPrice: bookingInfo ? bookingInfo.totalPrice : 0,
                };
            })
        );

        return { paymentList: paymentDetailsWithTotalPrice };
    }

    async getDetail(paymentID) {
        const paymentDetail = await paymentRepository.findById(paymentID);

        if (!paymentDetail) {
            throw { statusCode: 400, message: "Payment not found" };
        }

        const bookingInfo = await paymentRepository.findBookingById(paymentDetail.bookingID);
        paymentDetail.totalPrice = bookingInfo?.totalPrice || 0;

        return { payment: paymentDetail };
    }

    async create(data) {
        const { bookingID, status, method } = data;

        if (!bookingID) {
            throw { statusCode: 400, message: "bookingID is required" };
        }

        const booking = await paymentRepository.findBookingById(bookingID);
        if (!booking || booking.length === 0) {
            throw { statusCode: 404, message: "No booking found with the provided bookingID" };
        }

        const existingPayment = await paymentRepository.findByBookingId(bookingID);
        if (existingPayment.length > 0) {
            if (existingPayment[0].status === "unpaid") {
                throw { statusCode: 400, message: "This booking already has an associated payment" };
            }
            if (existingPayment[0].status === "paid") {
                throw { statusCode: 400, message: "This booking has already been paid" };
            }
        }

        const columns = ["bookingID", "status", "method"];
        const values = [bookingID, status, method];

        const newPayment = await paymentRepository.create(columns, values);
        return { data: newPayment };
    }

    async generateVietQR(amount, description) {
        const bodyRequest = {
            accountNo: vietQRConfig.ACCOUNT_NO,
            accountName: vietQRConfig.ACCOUNT_NAME,
            acqId: vietQRConfig.ACQID,
            amount: amount,
            addInfo: description,
            format: "text",
            template: "compact"
        };

        const response = await fetch("https://api.vietqr.io/v2/generate", {
            method: "POST",
            headers: {
                "x-client-id": vietQRConfig.VIETQR_CLIENT_ID,
                "x-api-key": vietQRConfig.VIETQR_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyRequest),
        });

        const data = await response.json();
        return data;
    }

    async update(paymentID, data) {
        const columns = [];
        const values = [];

        for (const key in data) {
            if (paymentTable.columns[key] !== undefined && data[key] !== "") {
                columns.push(paymentTable.columns[key]);
                values.push(data[key]);
            }
        }

        if (columns.length === 0) {
            throw { statusCode: 400, message: "No valid data to update" };
        }

        const updatePayment = await paymentRepository.update(paymentID, columns, values);

        if (!updatePayment) {
            throw { statusCode: 400, message: "Payment not found" };
        }

        return { msg: "Update successfully", data: updatePayment };
    }

    async softDelete(paymentID) {
        const update = await paymentRepository.softDelete(paymentID);

        if (!update) {
            throw { statusCode: 404, message: "Delete fail" };
        }

        return { msg: "Delete successfully", data: update };
    }
}

module.exports = new PaymentService();