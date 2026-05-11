const { getColsVals } = require("../../../helper/getColsVals.helper");
const customerTable = require("../../../model/table/customer.table");
const userTable = require("../../../model/table/user.table");
const customerRepository = require("../repositories/customer.repository");
const isValidId = require("../../../validates/reqIdParam.validate");

class CustomerService {
    async getDetail(customerID) {
        if (!isValidId(customerID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const customer = await customerRepository.findById(customerID);
        if (!customer) {
            throw { statusCode: 404, message: "Customer not found" };
        }

        const user = await customerRepository.findByUserId(customer.userID);
        if (!user) {
            throw { statusCode: 404, message: "User not found" };
        }

        const { password, refreshToken, ...others } = user;
        return { customer, user: others };
    }

    async getAll() {
        const customerList = await customerRepository.findAll();
        if (!customerList || customerList.length === 0) {
            throw { statusCode: 404, message: "No records of customer" };
        }
        return { customerList };
    }

    async update(customerID, data) {
        if (!isValidId(customerID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const result = await customerRepository.transaction(async () => {
            const { columns: customerColumns, values: customerValues } = getColsVals(customerTable, data);
            const { columns: userColumns, values: userValues } = getColsVals(userTable, data);

            const updateCustomer = await customerRepository.update(customerID, customerColumns, customerValues);
            if (!updateCustomer) {
                throw { statusCode: 404, message: "Customer not found" };
            }

            const userId = data.userID;
            const updateUser = await customerRepository.updateUser(userId, userColumns, userValues);
            if (!updateUser) {
                throw { statusCode: 404, message: "User not found" };
            }

            const { refreshToken, password, ...others } = updateUser;
            return { updateCustomer, updateUser: others };
        });

        return result;
    }

    async delete(customerID) {
        if (!isValidId(customerID)) {
            throw { statusCode: 400, message: "Invalid ID" };
        }

        const deleted = await customerRepository.delete(customerID);
        if (!deleted) {
            throw { statusCode: 404, message: "Delete customer fail" };
        }

        return { data: deleted };
    }
}

module.exports = new CustomerService();