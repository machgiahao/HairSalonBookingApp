const feedbackTable = require("../../../model/table/feedback.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");
const baseModel = require("../../../model/base.model")
const handleError = require("../../../helper/handleError.helper");
const bookingTable = require("../../../model/table/booking.table");
const customerTable = require("../../../model/table/customer.table");

const feedbackController = {
    create: async (req, res) => {
        try {
            const result = await baseModel.executeTransaction(async () => {
                const { columns: feedbackColumns, values: feedbackValues } = getColsVals(feedbackTable, req.body);
                const feedback = await baseModel.create(feedbackTable.name, feedbackColumns, feedbackValues);
                const booking = await baseModel.findByField(bookingTable.name, bookingTable.columns.bookingID, req.body.bookingID);
                let customer = null;
                if(booking.customerID) {
                    customer = await baseModel.findByField(customerTable.name, customerTable.columns.customerID, booking.customerID);
                }
                return { feedback: feedback, customer: customer }
            })

            return res.status(200).json({
                success: true,
                data: { 
                    feedback: result.feedback,
                    customer: result.customer
                }
            })
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    update: async (req, res) => {

    }

}

module.exports = feedbackController;