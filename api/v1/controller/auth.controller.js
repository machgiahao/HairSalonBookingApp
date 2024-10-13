const bcrypt = require("bcrypt");
const baseModel = require("../../../model/base.model");
const validate = require("../../../validates/validateInput");
const generate = require("../../../helper/generate.helper")
const roleHelper = require("../../../helper/role.helper");
const mail = require("../../../helper/sendMails.helper")
const userTable = require("../../../model/table/user.table")
const jwt = require("jsonwebtoken")

const authController = {
    register: async (req, res) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            const validateError = validate.validateInputField(req.body.password);
            if (validateError) {
                return res.status(400).json({
                    success: false,
                    msg: validateError
                });
            }
            // hash password
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);
            //Reassign hashed password for req.body.password
            req.body.password = hashed
            req.body.role = req.body.role ?? "Customer";
            // Create user 
            const columns = [];
            const values = [];

            for (const key in req.body) {
                // Kiểm tra và xử lý các cột cho bảng Customer
                if (userTable.columns[key] !== undefined && req.body[key] !== "") {
                    columns.push(userTable.columns[key]);
                    values.push(req.body[key]);
                }
            }

            const user = await baseModel.create(userTable.name, columns, values);
            const userByRole = await roleHelper.handleRole(user, req.body);
            return res.status(200).json({
                success: true,
                data: {
                    user: user,
                    userByRole: userByRole
                }
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: "Ịntenal server error"
            })
        }
    },

    login: async (req, res) => {
        try {
            const phoneNumber = req.body.phoneNumber;

            const validatePhoneError = validate.validateInputField(phoneNumber);
            if (validatePhoneError) {
                return res.status(400).json({
                    success: false,
                    msg: validatePhoneError
                })
            }
            const user = await baseModel.findByPhone("Users", "phoneNumber", phoneNumber);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    msg: "Phone number not registed !"
                })
            }

            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(401).json({
                    success: false,
                    msg: "Incorrect password !"
                })
            }
            // Generate Token
            const accessToken = generate.generateAccessToken(user);
            const refreshTokenStr = generate.generateRefreshToken(user);
            // Save refresh token in DB
            await baseModel.update("Users", "phoneNumber", user.phoneNumber, ["refreshToken"], [refreshTokenStr]);
            // Save refresh token in cookie
            res.cookie("refreshToken", refreshTokenStr, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict"
            });
            // Get additional information based on user role
            const tableByRole = roleHelper.getTableByRole(user);
            const actorByRole = await baseModel.findById(tableByRole, "userID", user.userID);

            const { password, refreshToken, ...others } = user;
            return res.status(200).json({
                success: true,
                actor: actorByRole,
                records: { ...others, accessToken }
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: "Ịnternal server error"
            })
        }
    },

    logout: async (req, res) => {
        res.clearCookie("refreshToken");
        await baseModel.update("Users", "userID", req.body.userID, ["refreshToken"], [""]);
        res.status(200).json({
            success: true,
            msg: "Logged out!"
        })
    },

    requestRefreshToken: async (req, res) => {
        const cookie = req.cookies;
        // Check refresh token is exist in cookie
        if (!cookie?.refreshToken) {
            return res.status(401).json({
                success: false,
                msg: "You're not authenticated!"
            })
        }
        // Check refresh token is valid or not 
        jwt.verify(cookie.refreshToken, process.env.JWT_REFRESH_KEY, async (err, user) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    msg: "Refresh token is not valid!"
                })
            }
            // Check refresh token matches with refresh token stored in db
            const response = await baseModel.findById("Users", "userID", user.userID);
            if (cookie.refreshToken !== response.refreshToken) {
                return res.status(403).json({
                    success: false,
                    msg: "Refresh token is not valid!"
                })
            }
            const newAccessToken = generate.generateAccessToken(response);
            const newRefreshtoken = generate.generateRefreshToken(response);
            await baseModel.update("Users", "userID", user.userID, ["refreshToken"], [newRefreshtoken]);
            res.cookie("refreshToken", newRefreshtoken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });
            return res.status(200).json({
                success: true,
                accessToken: newAccessToken
            });
        })
    },

    forgotPassword: async (req, res) => {
        try {
            const email = req.body.email;

            const user = await baseModel.findByField("Users", "email", email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    msg: "Email is not exist"
                })
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Create OTP 6 digits
            const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // OTP expired after 3m

            const otpTable = {
                userID: user.userID,
                otpCode: otp,
                expiresAt: expiresAt
            }

            await baseModel.create("OtpRequest", Object.keys(otpTable), Object.values(otpTable));
            await mail.sendMail(email, "Your OTP Code", `<p>Your OTP code is: <b>${otp}</b></p>`);

            return res.status(200).json({
                success: true,
                msg: "OTP code has been sent to your email",
                email: email
            })

        } catch (error) {
            console.error('Error in forgot-password:', error);
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { email, otp, newPassword } = req.body;

            const user = await baseModel.findByField("Users", "email", email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    msg: "Email is not exist"
                })
            }

            const conditions = [
                { column: 'userID', value: user.userID, operator: '=' },
                { column: 'otpCode', value: otp, operator: '=' },
                { column: 'expiresAt', value: new Date(), operator: '>' },
                { column: 'used', value: false, operator: '=' }
            ];

            const otpRequest = await baseModel.findWithConditions('OtpRequest', ['*'], conditions, ['AND']);

            if (!otpRequest || otpRequest.length === 0) {
                return res.status(400).json({
                    success: false,
                    msg: "OTP code is invalid or expired"
                })
            }

            // hash password
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(newPassword, salt);

            await baseModel.update("Users", "userID", user.userID, ["password"], [hashed]);
            await baseModel.update("OtpRequest", "id", otpRequest.id, ["used"], ["true"]);

            return res.status(200).json({
                success: true,
                msg: "Update password successfully"
            })
        } catch (error) {
            console.error('Error in forgot-password:', error);
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    }


}

module.exports = authController;