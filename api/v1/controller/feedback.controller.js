const feedbackTable = require("../../../model/table/feedback.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");
const baseModel = require("../../../model/base.model")
const handleError = require("../../../helper/handleError.helper");

const feedbackController = {
    create: async (req, res) => {
        try {
            const result = await baseModel.executeTransaction(async () => {
                const { columns: feedbackColumns, values: feedbackValues } = getColsVals(feedbackTable, req.body);
                const feedback = await baseModel.create(feedbackTable.name, feedbackColumns, feedbackValues);
                return { feedback: feedback }
            })

            return res.status(200).json({
                success: true,
                data: result.feedback
            })
        } catch (error) {
            return handleError(res, 500, error);
        }
    }

}

module.exports = feedbackController;