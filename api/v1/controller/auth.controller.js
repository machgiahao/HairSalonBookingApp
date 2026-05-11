const authService = require("../services/auth.service");
const handleResponse = require("../../../helper/handleReponse.helper");
const handleError = require("../../../helper/handleError.helper");

const authController = {
    register: async (req, res) => {
        try {
            const result = await authService.register(req.body);
            return handleResponse(res, 201, {
                success: true,
                data: result
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    login: async (req, res) => {
        try {
            const { phoneNumber, password } = req.body;
            const result = await authService.login(phoneNumber, password);

            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict"
            });

            return handleResponse(res, 200, {
                success: true,
                actor: result.actor,
                records: result.records
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    logout: async (req, res) => {
        try {
            await authService.logout(req.body.userID);
            res.clearCookie("refreshToken");

            return handleResponse(res, 200, {
                success: true,
                msg: "Logged out!"
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    requestRefreshToken: async (req, res) => {
        try {
            const cookie = req.cookies;
            if (!cookie?.refreshToken) {
                throw { statusCode: 401, message: "You're not authenticated!" };
            }

            const result = await authService.refreshToken(req.user.userID, cookie.refreshToken);

            res.cookie("refreshToken", result.newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict"
            });

            return handleResponse(res, 200, {
                success: true,
                accessToken: result.accessToken
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);

            return handleResponse(res, 200, {
                success: true,
                msg: result.message,
                email: result.email
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { email, otp, newPassword } = req.body;
            const result = await authService.resetPassword(email, otp, newPassword);

            return handleResponse(res, 200, {
                success: true,
                msg: result.message
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    },

    changePassword: async (req, res) => {
        try {
            const { password, newPassword } = req.body;
            const result = await authService.changePassword(req.user.userID, password, newPassword);

            return handleResponse(res, 200, {
                success: true,
                msg: "Password changed successfully",
                data: result.data
            });
        } catch (error) {
            return handleError(res, error.statusCode, error);
        }
    }
};

module.exports = authController;