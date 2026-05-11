const feedbackTable = require("../../../model/table/feedback.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");
const feedbackRepository = require("../repositories/feedback.repository");
const { findFeedbackJoin } = require("../../../helper/findBookingDetails.helper");
const isValidId = require("../../../validates/reqIdParam.validate");

class FeedbackService {
    async getDetail(feedbackID) {
        if (!isValidId(feedbackID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const feedback = await feedbackRepository.findById(feedbackID);
        if (!feedback) {
            throw { statusCode: 404, message: "Feedback not found" };
        }

        const result = await findFeedbackJoin(feedback);
        return { feedback: result };
    }

    async getAll(query) {
        const limit = Math.abs(parseInt(query.perpage)) || null;
        const offset = (Math.abs(parseInt(query.page) || 1) - 1) * limit;

        const feedbacks = await feedbackRepository.findAll(limit, offset);
        if (!feedbacks || feedbacks.length === 0) {
            throw { statusCode: 404, message: "No records of feedback" };
        }

        const detailedFeedbacks = await Promise.all(
            feedbacks.map(async (feedback) => await findFeedbackJoin(feedback))
        );
        const flatFeedbacks = detailedFeedbacks.flat();

        return { feedbacks: flatFeedbacks };
    }

    async create(data) {
        const result = await feedbackRepository.transaction(async () => {
            const { columns, values } = getColsVals(feedbackTable, data);
            const feedback = await feedbackRepository.create(columns, values);

            if (!feedback) {
                throw { statusCode: 400, message: "Create feedback fail" };
            }

            const booking = await feedbackRepository.findBookingById(data.bookingID);
            let customer = null;
            if (booking?.customerID) {
                customer = await feedbackRepository.findCustomerById(booking.customerID);
            }

            return { feedback, customer };
        });

        return result;
    }

    async update(feedbackID, data) {
        if (!isValidId(feedbackID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const result = await feedbackRepository.transaction(async () => {
            const { columns, values } = getColsVals(feedbackTable, data);
            const updateFeedback = await feedbackRepository.update(feedbackID, columns, values);

            if (!updateFeedback) {
                throw { statusCode: 400, message: "Update feedback fail" };
            }

            return { updateFeedback };
        });

        return { data: result.updateFeedback };
    }

    async delete(feedbackID) {
        if (!isValidId(feedbackID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const result = await feedbackRepository.delete(feedbackID);
        if (!result) {
            throw { statusCode: 400, message: "Delete feedback fail" };
        }

        return { data: result };
    }
}

module.exports = new FeedbackService();