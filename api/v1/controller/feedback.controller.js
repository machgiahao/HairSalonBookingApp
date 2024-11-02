const feedbackTable = require("../../../model/table/feedback.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");
const baseModel = require("../../../model/base.model")
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const bookingTable = require("../../../model/table/booking.table");
const customerTable = require("../../../model/table/customer.table");
const isValidId = require("../../../validates/reqIdParam.validate");
const { findFeedbackJoin } = require("../../../helper/findBookingDetails.helper");

const feedbackController = {
    detail: async (req, res) => {
        let statusCode
        try {
            const feedbackID = req.query.id;
            if (!isValidId(feedbackID)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const feedback = await baseModel.findByField(feedbackTable.name, feedbackTable.columns.feedbackID, feedbackID);            
            if (!feedback) {
                statusCode = 404
                throw new Error("Feedback not found");
            }
            const result = await findFeedbackJoin(feedback);

            return handleResponse(res, 200, { feedback: result })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    getAll: async (req, res) => {
        let statusCode
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
                statusCode = 404
                throw new Error("No records of feedback");
            }

            return handleResponse(res, 200, { feedbacks: feedbacks })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    create: async (req, res) => {
        let statusCode
        try {
            const result = await baseModel.executeTransaction(async () => {
                const { columns: feedbackColumns, values: feedbackValues } = getColsVals(feedbackTable, req.body);
                const feedback = await baseModel.create(feedbackTable.name, feedbackColumns, feedbackValues);
                if (!feedback) {
                    statusCode = 400
                    throw new Error("Create feedback fail");
                }
                const booking = await baseModel.findByField(bookingTable.name, bookingTable.columns.bookingID, req.body.bookingID);
                let customer = null;
                if (booking.customerID) {
                    customer = await baseModel.findByField(customerTable.name, customerTable.columns.customerID, booking.customerID);
                }
                return { feedback: feedback, customer: customer }
            })

            return handleResponse(res, 200, {
                data: {
                    feedback: result.feedback,
                    customer: result.customer
                }
            })

        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    update: async (req, res) => {
        let statusCode
        try {
            const feedbackID = req.query.id;
            if (!isValidId(feedbackID)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const result = await baseModel.executeTransaction(async () => {
                const { columns: feedbackColumns, values: feedbackValues } = getColsVals(feedbackTable, req.body);
                const updateFeedback = await baseModel.update(feedbackTable.name, feedbackTable.columns.feedbackID, feedbackID, feedbackColumns, feedbackValues);
                if (!updateFeedback) {
                    statusCode = 400
                    throw new Error("Update feedback fail");
                }
                return { updateFeedback: updateFeedback }
            })

            return handleResponse(res, 200, { data: result.updateFeedback })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    delete: async (req, res) => {
        let statusCode
        try {
            const feedbackID = req.query.id;
            if (!isValidId(feedbackID)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const result = await baseModel.executeTransaction(async () => {
                const deleted = await baseModel.update(feedbackTable.name, feedbackTable.columns.feedbackID, feedbackID, ["deleted"], [true]);
                if (!deleted) {
                    statusCode = 400
                    throw new Error("Delete feedback fail");
                }
                return deleted
            })

            return handleResponse(res, 200, { data: result })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    }

}

module.exports = feedbackController;