const roleHelper = require("../../../helper/role.helper");
const { sendMail } = require("../../../helper/sendMails.helper");
const userTable = require("../../../model/table/user.table");
const userRepository = require("../repositories/user.repository");
const isValidId = require("../../../validates/reqIdParam.validate");

class UserService {
    async getAll() {
        const userList = await userRepository.findAll();
        if (!userList || userList.length === 0) {
            throw { statusCode: 404, message: "No records of user" };
        }
        return { userList };
    }

    async getCurrent(userID) {
        if (!isValidId(userID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const user = await userRepository.findById(userID);
        if (!user) {
            throw { statusCode: 404, message: "User not found" };
        }

        const tableByRole = roleHelper.getTableByRole(user);
        const actorByRole = await userRepository.findById(tableByRole, userTable.columns.userID, userID);

        const { password, refreshToken, ...others } = user;
        return { actorByRole, record: others };
    }

    async contact(email, title, content) {
        if (!email || !title || !content) {
            throw { statusCode: 400, message: "Email, title, and content fields are required" };
        }

        const emailReceive = process.env.MAIL_FROM_ADDRESS;
        await sendMail(email, emailReceive, title, content);

        return { msg: "Email sent successfully" };
    }
}

module.exports = new UserService();