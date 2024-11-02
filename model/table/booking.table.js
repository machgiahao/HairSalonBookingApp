const bookingTable = {
    name: "Booking",
    columns: {
        bookingID: "bookingID",
        stylistID: "stylistID",
        stylistWorkShiftID: "stylistWorkShiftID",
        guestID: "guestID",
        customerID: "customerID", 
        status: "status",
        originalPrice: "originalPrice",
        discountPrice: "discountPrice",
        note: "note",
        createdAt: "createAt",
        appointmentAt: "appointmentAt",
        deleted: "deleted"
    }
}

module.exports = bookingTable;