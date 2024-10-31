const bcrypt = require("bcrypt");
const baseModel = require("../../../model/base.model");
const validate = require("../../../validates/validateInput");
const generate = require("../../../helper/generate.helper");
const roleHelper = require("../../../helper/role.helper");
const mail = require("../../../helper/sendMails.helper");
const userTable = require("../../../model/table/user.table");
const jwt = require("jsonwebtoken");
const { getColsVals } = require("../../../helper/getColsVals.helper");

const authController = {
    register: async (req, res) => {
        try {
            const { phoneNumber, email } = req.body;

            // Check exist phone number
            const checkPhone = await baseModel.findByField("Users", "phoneNumber", phoneNumber);
            if (checkPhone) {
                statusCode = 401
                throw new Error("Phone number already exist");
            }

            // Check exist email
            const checkEmail = await baseModel.findByField("Users", "email", email);
            if (checkEmail) {
                statusCode = 401
                throw new Error("Email already exist");
            }
            // Check password 
            validate.validateInputField(req.body.password, "Password");
            // hash password
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);
            //Reassign hashed password for req.body.password
            req.body.password = hashed
            req.body.role = req.body.role ?? "Customer";
            // Create user 
            const { columns, values } = getColsVals(userTable, req.body);

            // Create and save to db
            const result = await baseModel.executeTransaction(async () => {
                const user = await baseModel.create(userTable.name, columns, values);
                const userByRole = await roleHelper.handleRole(user, req.body);
                return { user: user, userByRole: userByRole }
            })
            return handleResponse(res, 201, {
                success: true,
                data: {
                    user: result.user,
                    userByRole: result.userByRole
                }
            })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    login: async (req, res) => {
        try {
            const phoneNumber = req.body.phoneNumber;
            validate.validateInputField(phoneNumber, "Phone number");

            const user = await baseModel.findByPhone("Users", "phoneNumber", phoneNumber);
            if (!user) {
                throw new Error("Phone number not registed !");
            }

            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                throw new Error("Incorrect password !");
            }

            // Generate Token
            const accessToken = generate.generateAccessToken(user);
            const refreshTokenStr = generate.generateRefreshToken(user);
            // Save refresh token in DB
            await baseModel.executeTransaction(async () => {
                await baseModel.update("Users", "phoneNumber", user.phoneNumber, ["refreshToken"], [refreshTokenStr]);
            })
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
                error: error.message
            })
        }
    },

    logout: async (req, res) => {
        try {
            res.clearCookie("refreshToken");
            await baseModel.executeTransaction(async () => {
                await baseModel.update("Users", "userID", req.body.userID, ["refreshToken"], [""]);
            })
            res.status(200).json({
                success: true,
                msg: "Logged out!"
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    },

    requestRefreshToken: async (req, res) => {
        try {
            const cookie = req.cookies;
            // Check refresh token is exist in cookie
            if (!cookie?.refreshToken) {
                throw new Error("You're not authenticated!");
            }
            // Check refresh token is valid or not 
            jwt.verify(cookie.refreshToken, process.env.JWT_REFRESH_KEY, async (err, user) => {
                if (err) {
                    throw new Error("Refresh token is not valid!");
                }
                // Check refresh token matches with refresh token stored in db
                const response = await baseModel.findById("Users", "userID", user.userID);
                if (cookie.refreshToken !== response.refreshToken) {
                    throw new Error("Refresh token is not valid!")
                }
                const newAccessToken = generate.generateAccessToken(response);
                const newRefreshtoken = generate.generateRefreshToken(response);
                await baseModel.executeTransaction(async () => {
                    await baseModel.update("Users", "userID", user.userID, ["refreshToken"], [newRefreshtoken]);
                })
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
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const email = req.body.email;

            const user = await baseModel.findByField(userTable.name, userTable.columns.email, email);
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
            await baseModel.executeTransaction(async () => {
                await baseModel.create("OtpRequest", Object.keys(otpTable), Object.values(otpTable));
            })
            const from = process.env.MAIL_FROM_ADDRESS;
            await mail.sendMail(from, email, "Your OTP Code", `<p>Your OTP code is: <b>${otp}</b></p>`);

            return res.status(200).json({
                success: true,
                msg: "OTP code has been sent to your email",
                email: email
            })

        } catch (error) {
            console.error('Error in forgot-password:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { email, otp, newPassword } = req.body;

            const user = await baseModel.findByField(userTable.name,userTable.columns.email, email);
            if (!user) {
                throw new Error("Email is not exist");
            }

            const conditions = [
                { column: 'userID', value: user.userID, operator: '=' },
                { column: 'otpCode', value: otp, operator: '=' },
                { column: 'expiresAt', value: new Date(), operator: '>' },
                { column: 'used', value: false, operator: '=' }
            ];

            const otpRequest = await baseModel.findWithConditions('OtpRequest', ['*'], conditions, ['AND']);

            if (!otpRequest || otpRequest.length === 0) {
                throw new Error("OTP code is invalid or expired");
            }

            // hash password
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(newPassword, salt);
            await baseModel.executeTransaction(async () => {
                await baseModel.update("Users", "userID", user.userID, ["password"], [hashed]);
                await baseModel.update("OtpRequest", "id", otpRequest.id, ["used"], ["true"]);
            })

            return res.status(200).json({
                success: true,
                msg: "Update password successfully"
            })
        } catch (error) {
            console.error('Error in forgot-password:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    },

    changePassword: async (req, res) => {
        try {
            const id = req.user.userID;

            const userById = await baseModel.findByField(userTable.name, userTable.columns.userID, id);
            if (!userById) {
                throw new Error("User not found");
            }

            const oldPassword = userById.password;
            const inputPassword = req.body.password;

            const validPassword = await bcrypt.compare(inputPassword, oldPassword);
            if (!validPassword) {
                throw new Error("Password does not match");
            }

            const result = await baseModel.executeTransaction(async () => {
                const newPassword = req.body.newPassword;
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(newPassword, salt);
                const update = await baseModel.update(userTable.name, userTable.columns.userID, id, ["password"], [hashed]);
                const { password, refreshToken, ...others } = update;
                return { update: others };
            })
            return res.status(200).json({
                success: true,
                msg: "Change password successfully",
                data: result.update
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    }

}

module.exports = authController;