const feedbackTable = require("../../../model/table/feedback.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");
const baseModel = require("../../../model/base.model")
const handleError = require("../../../helper/handleError.helper");
const bookingTable = require("../../../model/table/booking.table");
const customerTable = require("../../../model/table/customer.table");

const feedbackController = {
    detail: async (req, res) => {
        try {
            const feedbackID = req.query.id;

            const feedback = await baseModel.findByField(feedbackTable.name, feedbackTable.columns.feedbackID, feedbackID);
            if (!feedback) {
                return handleError(res, 404, new Error("Feedback not found"));
            }
            return res.status(200).json({
                success: true,
                feedback: feedback
            })

        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    getAll: async (req, res) => {
        try {
            const limit = Math.abs(parseInt(req.query.perpage)) || null;
            const offset = (Math.abs(parseInt(req.query.page) || 1) - 1) * limit;

            const feedbacks = await baseModel.findWithConditions(
                feedbackTable.name,
                undefined,
                [],
                [],
                [],
                limit,
                offset
            )

            if (!feedbacks || feedbacks.length === 0) {
                return handleError(res, 404, new Error("Feedback not found"));
            }

            return res.status(200).json({
                success: true,
                feedbacks: feedbacks
            })
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    create: async (req, res) => {
        try {
            const result = await baseModel.executeTransaction(async () => {
                const { columns: feedbackColumns, values: feedbackValues } = getColsVals(feedbackTable, req.body);
                const feedback = await baseModel.create(feedbackTable.name, feedbackColumns, feedbackValues);
                const booking = await baseModel.findByField(bookingTable.name, bookingTable.columns.bookingID, req.body.bookingID);
                let customer = null;
                if (booking.customerID) {
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
        try {
            const feedbackID = req.query.id;
            const result = await baseModel.executeTransaction(async () => {
                const { columns: feedbackColumns, values: feedbackValues } = getColsVals(feedbackTable, req.body);
                const updateFeedback = await baseModel.update(feedbackTable.name, feedbackTable.columns.feedbackID, feedbackID, feedbackColumns, feedbackValues);
                if (!updateFeedback) {
                    throw new Error("Feedback not found");
                    
                }
                return { updateFeedback: updateFeedback }
            })

            return res.status(200).json({
                success: true,
                data: result.updateFeedback
            })
        } catch (error) {
            return handleError(res, 500, error);
        }
    },

    delete: async (req, res) => {
        try {
            const feedbackID = req.query.id;

            const result = await baseModel.executeTransaction(async () => {
                const deleted = await baseModel.update(feedbackTable.name, feedbackTable.columns.feedbackID, feedbackID, ["deleted"], [true]);
                if (!deleted) {
                    return res.status(404).json({
                        success: false,
                        msg: "Delete fail"
                    });
                }
                return deleted
            })

            res.status(200).json({
                success: true,
                msg: "Delete successfully",
                data: result
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    }

}

module.exports = feedbackController;