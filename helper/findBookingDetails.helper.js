const baseModel = require("../model/base.model")
const bookingTable = require("../model/table/booking.table")
const userTable = require("../model/table/user.table")
const customerTable = require("../model/table/customer.table")
const guestTable = require("../model/table/guest.table")

const findBookingDetail = {
    findDetailJoins: async (booking) => {
        let result = null;
        if (booking.customerID) {
            result = await baseModel.findWithConditionsJoin(
                bookingTable.name, // Booking
                ['"Booking".*', '"Users"."phoneNumber"', '"Customer"."fullName"'],
                [{ column: 'bookingID', value: booking.bookingID, operator: '=' }],
                [],
                [ // Joins
                    {
                        table: customerTable.name,
                        on: `"${customerTable.name}"."${customerTable.columns.customerID}" = "${bookingTable.name}"."${bookingTable.columns.customerID}"`,
                        type: 'INNER'
                    }, // Join table customer
                    {
                        table: userTable.name,
                        on: `"${customerTable.name}"."${customerTable.columns.userID}" = "${userTable.name}"."${userTable.columns.userID}"`,
                        type: 'INNER'
                    } // Join table user
                ],
                [],
                undefined,
                undefined
            )
        } else {
            result = await baseModel.findWithConditionsJoin(
                bookingTable.name, // Booking
                ['"Booking".*', '"Guest"."phoneNumber"', '"Guest"."fullName"'],
                [{ column: 'bookingID', value: booking.bookingID, operator: '=' }],
                [],
                [ // Joins
                    {
                        table: guestTable.name,
                        on: `"${guestTable.name}"."${guestTable.columns.guestID}" = "${bookingTable.name}"."${bookingTable.columns.guestID}"`,
                        type: 'INNER'
                    }, // Join table guest
                ],
                [],
                undefined,
                undefined
            )
        }

        return result;
    },

    findAllJoins: async (limit, offset, order) => {
        const recordCustomer = await baseModel.findWithConditionsJoin(
            bookingTable.name, // Booking
            ['"Booking".*', '"Users"."phoneNumber"', '"Customer"."fullName"'],
            [],
            [],
            [ // Joins
                {
                    table: customerTable.name,
                    on: `"${customerTable.name}"."${customerTable.columns.customerID}" = "${bookingTable.name}"."${bookingTable.columns.customerID}"`,
                    type: 'INNER'
                }, // Join table customer
                {
                    table: userTable.name,
                    on: `"${customerTable.name}"."${customerTable.columns.userID}" = "${userTable.name}"."${userTable.columns.userID}"`,
                    type: 'INNER'
                } // Join table user
            ],
            [order],
            limit,
            offset
        )

        const recordGuest = await baseModel.findWithConditionsJoin(
            bookingTable.name, // Booking
            ['"Booking".*', '"Guest"."phoneNumber"', '"Guest"."fullName"'],
            [],
            [],
            [ // Joins
                {
                    table: guestTable.name,
                    on: `"${guestTable.name}"."${guestTable.columns.guestID}" = "${bookingTable.name}"."${bookingTable.columns.guestID}"`,
                    type: 'INNER'
                }, // Join table guest
            ],
            [order],
            limit,
            offset
        )

        const result = [...recordCustomer, ...recordGuest];
        return result;
    }



}

module.exports = findBookingDetail;

