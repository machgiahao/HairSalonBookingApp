/**
 * @swagger
 * /booking/create:
 *   post:
 *     tags: [Booking]
 *     summary: Create new booking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerID
 *               - stylistID
 *               - serviceIDs
 *               - bookingDate
 *             properties:
 *               customerID:
 *                 type: string
 *               stylistID:
 *                 type: string
 *               serviceIDs:
 *                 type: array
 *                 items:
 *                   type: string
 *               bookingDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

const bookingService = require("../services/booking.service");
const handleError = require("../../../helper/handleError.helper");
const handleResponse = require("../../../helper/handleReponse.helper");

const bookingController = {
    create: async (req, res) => {
        try {
            const result = await bookingService.create(req.body);
            return handleResponse(res, 201, {
                newBooking: result.newBooking,
                newDetails: result.newDetails,
                updateWorkshift: result.updateStylistWorkshift
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    detail: async (req, res) => {
        try {
            const bookingID = req.query.bookingID;
            const result = await bookingService.getDetail(bookingID);

            return handleResponse(res, 200, {
                success: true,
                booking: result.booking,
                details: result.details
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    getAll: async (req, res) => {
        try {
            const result = await bookingService.getAll(req.query);
            return handleResponse(res, 200, { bookings: result.bookings });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    update: async (req, res) => {
        try {
            const bookingID = req.body.bookingID;
            const result = await bookingService.update(bookingID, req.body);

            return handleResponse(res, 200, {
                updateBooking: result.newBooking,
                newDetails: result.newDetails,
                updateWorkshift: result.updateWorkshift
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    changeStatus: async (req, res) => {
        try {
            const { bookingID, status } = req.body;
            const result = await bookingService.changeStatus(bookingID, status);

            return handleResponse(res, 200, {
                data: {
                    booking: result.booking,
                    customer: result.customer,
                    stylistWorkShift: result.stylistWorkShift
                }
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    delete: async (req, res) => {
        try {
            const bookingID = req.query.bookingID;
            const result = await bookingService.delete(bookingID);
            return handleResponse(res, 200, { data: result });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    history: async (req, res) => {
        try {
            const customerID = req.query.id;
            const result = await bookingService.getHistory(customerID, req.query);
            return handleResponse(res, 200, { data: result.data });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = bookingController;