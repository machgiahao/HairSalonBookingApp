const paymentService = require("../services/payment.service");
const handleError = require("../../../helper/handleError.helper");

const paymentController = {
    getAll: async (req, res) => {
        try {
            const result = await paymentService.getAll();
            return res.status(200).json({
                success: true,
                paymentList: result.paymentList
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getDetail: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await paymentService.getDetail(id);
            return res.status(200).json({
                success: true,
                payment: result.payment
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    create: async (req, res) => {
        try {
            const result = await paymentService.create(req.body);
            return res.status(200).json({
                success: true,
                data: result.data
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    generateVietQR: async (req, res) => {
        try {
            const { Amount, Description } = req.body;
            const result = await paymentService.generateVietQR(Amount, Description);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: "Failed to generate QR code" });
        }
    },

    update: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await paymentService.update(id, req.body);
            return res.status(200).json({
                success: true,
                msg: result.msg,
                data: result.data
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    softDel: async (req, res) => {
        try {
            const id = req.query.id;
            const result = await paymentService.softDelete(id);
            return res.status(200).json({
                success: true,
                msg: result.msg,
                data: result.data
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = paymentController;