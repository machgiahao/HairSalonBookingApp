const bookingTable = {
    name: "Booking",
    columns: {
        bookingID: "bookingID",
        guest: "guestID",
        customerID: "customerID", 
        status: "status",
        totalPrice: "totalPrice",
        note: "note",
        appointmentAt: "appointmentAt",
        deleted: "deleted"
    }
}

module.exports = bookingTable;