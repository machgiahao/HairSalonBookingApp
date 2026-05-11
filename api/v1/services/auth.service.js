const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validate = require("../../../validates/validateInput");
const generate = require("../../../helper/generate.helper");
const roleHelper = require("../../../helper/role.helper");
const mail = require("../../../helper/sendMails.helper");
const userTable = require("../../../model/table/user.table");
const { getColsVals } = require("../../../helper/getColsVals.helper");
const authRepository = require("../repositories/auth.repository");

class AuthService {
    async register(data) {
        const { phoneNumber, email, password, role } = data;

        validate.validatePhone(phoneNumber);
        validate.validateEmail(email);
        validate.validateInputField(password, "Password");

        const existingPhone = await authRepository.findUserByField(userTable.columns.phoneNumber, phoneNumber);
        if (existingPhone) {
            throw { statusCode: 401, message: "Phone number already exist" };
        }

        const existingEmail = await authRepository.findUserByField(userTable.columns.email, email);
        if (existingEmail) {
            throw { statusCode: 401, message: "Email already exist" };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            ...data,
            password: hashedPassword,
            role: role ?? "Customer"
        };

        const { columns, values } = getColsVals(userTable, userData);
        const user = await authRepository.createUser(columns, values);
        const userByRole = await roleHelper.handleRole(user, userData);

        return { user, userByRole };
    }

    async login(phoneNumber, password) {
        validate.validateInputField(phoneNumber, "Phone number");

        const user = await authRepository.findUserByPhone(phoneNumber);
        if (!user) {
            throw { statusCode: 401, message: "Phone number not registered!" };
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw { statusCode: 401, message: "Incorrect password!" };
        }

        const accessToken = generate.generateAccessToken(user);
        const refreshTokenStr = generate.generateRefreshToken(user);

        await authRepository.updateRefreshToken(user.userID, refreshTokenStr);

        const tableByRole = roleHelper.getTableByRole(user);
        const actorByRole = await authRepository.findById(tableByRole, "userID", user.userID);

        const { password: _, refreshToken, ...others } = user;

        return {
            actor: actorByRole,
            records: { ...others, accessToken }
        };
    }

    async logout(userID) {
        await authRepository.updateRefreshToken(userID, "");
        return { message: "Logged out!" };
    }

    async refreshToken(userID, refreshTokenFromCookie) {
        const user = await authRepository.findUserById(userID);

        if (!user || refreshTokenFromCookie !== user.refreshToken) {
            throw { statusCode: 403, message: "Refresh token is not valid!" };
        }

        const newAccessToken = generate.generateAccessToken(user);
        const newRefreshToken = generate.generateRefreshToken(user);

        await authRepository.updateRefreshToken(userID, newRefreshToken);

        return { accessToken: newAccessToken };
    }

    async forgotPassword(email) {
        const user = await authRepository.findUserByField(userTable.columns.email, email);
        if (!user) {
            throw { statusCode: 403, message: "Email does not exist" };
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

        const otpData = {
            userID: user.userID,
            otpCode: otp,
            expiresAt: expiresAt
        };

        await authRepository.createOtp(otpData);

        const from = process.env.MAIL_FROM_ADDRESS;
        await mail.sendMail(from, email, "Your OTP Code", `<p>Your OTP code is: <b>${otp}</b></p>`);

        return { message: "OTP code has been sent to your email", email };
    }

    async resetPassword(email, otp, newPassword) {
        const user = await authRepository.findUserByField(userTable.columns.email, email);
        if (!user) {
            throw { statusCode: 404, message: "Email does not exist" };
        }

        const otpRequests = await authRepository.findOtpByUserId(user.userID);
        const validOtp = otpRequests?.find(o => o.otpCode === otp);

        if (!validOtp) {
            throw { statusCode: 403, message: "OTP code is invalid or expired" };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await authRepository.updatePassword(user.userID, hashedPassword);
        await authRepository.markOtpUsed(validOtp.id);

        return { message: "Password updated successfully" };
    }

    async changePassword(userID, currentPassword, newPassword) {
        const user = await authRepository.findUserByField(userTable.columns.userID, userID);
        if (!user) {
            throw { statusCode: 404, message: "User not found" };
        }

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            throw { statusCode: 403, message: "Current password does not match" };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updated = await authRepository.updatePassword(userID, hashedPassword);
        const { password, refreshToken, ...others } = updated;

        return { data: others };
    }
}

module.exports = new AuthService();