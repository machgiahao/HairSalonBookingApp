const bookingTable = {
    name: "Booking",
    columns: {
        bookingID: "bookingID",
        stylistID: "stylistID",
        guest: "guestID",
        customerID: "customerID", 
        status: "status",
        totalPrice: "totalPrice",
        note: "note",
        createAt: "createAt",
        appointmentAt: "appointmentAt",
        deleted: "deleted"
    }
}

module.exports = bookingTable;