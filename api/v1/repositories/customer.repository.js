const baseModel = require("../../../model/base.model");
const customerTable = require("../../../model/table/customer.table");
const userTable = require("../../../model/table/user.table");

class CustomerRepository {
    async findById(customerID) {
        return await baseModel.findByField(customerTable.name, customerTable.columns.customerID, customerID);
    }

    async findByUserId(userID) {
        return await baseModel.findByField(userTable.name, userTable.columns.userID, userID);
    }

    async findAll() {
        return await baseModel.findAllWithPhone("Customer");
    }

    async update(customerID, columns, values) {
        return await baseModel.update(customerTable.name, customerTable.columns.customerID, customerID, columns, values);
    }

    async updateUser(userID, columns, values) {
        return await baseModel.update(userTable.name, userTable.columns.userID, userID, columns, values);
    }

    async delete(customerID) {
        return await baseModel.update(customerTable.name, customerTable.columns.customerID, customerID, ["deleted"], [true]);
    }

    async transaction(callback) {
        return await baseModel.executeTransaction(callback);
    }
}

module.exports = new CustomerRepository();