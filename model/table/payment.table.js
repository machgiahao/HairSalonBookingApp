const paymentTable = {
    name: "Payment",
    columns: {
        paymentID: "paymentID",
        bookingID: "bookingID",
        method: "method",
        createdAt: "createdAt",
        status: "status",
        deleted: "deleted"
    }
}

module.exports = paymentTable;