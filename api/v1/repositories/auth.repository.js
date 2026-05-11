const baseModel = require("../../../model/base.model");
const userTable = require("../../../model/table/user.table");

class AuthRepository {
    async findUserByPhone(phoneNumber) {
        return await baseModel.findByPhone("Users", "phoneNumber", phoneNumber);
    }

    async findUserByEmail(email) {
        return await baseModel.findByField(userTable.name, userTable.columns.email, email);
    }

    async findUserById(userID) {
        return await baseModel.findById(userTable.name, userTable.columns.userID, userID);
    }

    async findUserByField(column, value) {
        return await baseModel.findByField(userTable.name, column, value);
    }

    async createUser(columns, values) {
        return await baseModel.create(userTable.name, columns, values);
    }

    async updateUser(userID, columns, values) {
        return await baseModel.update(userTable.name, userTable.columns.userID, userID, columns, values);
    }

    async updateRefreshToken(userID, refreshToken) {
        return await baseModel.executeTransaction(async () => {
            await baseModel.update("Users", "userID", userID, ["refreshToken"], [refreshToken]);
        });
    }

    async updatePassword(userID, hashedPassword) {
        return await baseModel.executeTransaction(async () => {
            return await baseModel.update(userTable.name, userTable.columns.userID, userID, ["password"], [hashedPassword]);
        });
    }

    async createOtp(otpData) {
        return await baseModel.executeTransaction(async () => {
            return await baseModel.create("OtpRequest", Object.keys(otpData), Object.values(otpData));
        });
    }

    async findOtpByUserId(userID) {
        const conditions = [
            { column: 'userID', value: userID, operator: '=' },
            { column: 'expiresAt', value: new Date(), operator: '>' },
            { column: 'used', value: false, operator: '=' }
        ];
        return await baseModel.findWithConditions('OtpRequest', ['*'], conditions, ['AND']);
    }

    async markOtpUsed(otpId) {
        return await baseModel.executeTransaction(async () => {
            return await baseModel.update("OtpRequest", "id", otpId, ["used"], ["true"]);
        });
    }
}

module.exports = new AuthRepository();