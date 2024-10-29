const { getColsVals } = require("../../../helper/getColsVals.helper");
const handleResponse = require("../../../helper/handleReponse.helper");
const handleError= require("../../../helper/handleError.helper");
const baseModel = require("../../../model/base.model")
const customerTable = require("../../../model/table/customer.table")
const userTable = require("../../../model/table/user.table")
const isValidId = require("../../../validates/reqIdParam.validate");

const customerController = {
    detail: async (req, res) => {
        let statusCode
        try {
            const id = req.query.id;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const customer = await baseModel.findByField(customerTable.name, customerTable.columns.customerID, id);
            if (!customer) {
                statusCode = 404
                throw new Error("Customer not found");
            }

            const user = await baseModel.findByField(userTable.name, userTable.columns.userID, customer.userID);
            if (!user) {
                statusCode = 404
                throw new Error("User not found");

            }
            const { password, refreshToken, ...others } = user;
            return handleResponse(res, 200, {
                data: {
                    customer: customer,
                    user: others
                }
            })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },
    update: async (req, res) => {
        let statusCode
        try {
            const id = req.query.id;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const result = await baseModel.executeTransaction(async () => {
                const { columns: customerColumns, values: customerValues } = getColsVals(customerTable, req.body);
                const { columns: userColumns, values: userValues } = getColsVals(userTable, req.body);
                // Update table customer
                const updateCustomer = await baseModel.update(customerTable.name, customerTable.columns.customerID, id, customerColumns, customerValues);
                if (!updateCustomer) {
                    statusCode = 404
                    throw new Error("Customer not found");
                }
                // Update table user
                const userId = req.body.userID;
                const updateUser = await baseModel.update(userTable.name, userTable.columns.userID, userId, userColumns, userValues);
                if (!updateUser) {
                    statusCode = 404
                    throw new Error("User not found");
                }
                const { refreshToken, password, ...others } = updateUser;
                return { updateCustomer: updateCustomer, updateUser: others }
            })

            return handleResponse(res, 200, {
                data: {
                    updateCustomer: result.updateCustomer,
                    updateUser: result.updateUser
                }
            })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    delete: async (req, res) => {
        let statusCode
        try {
            const id = req.query.id;
            if (!isValidId(id)) {
                statusCode = 400
                throw new Error("Invalid ID");
            }
            const result = await baseModel.executeTransaction(async () => {
                const deleted = await baseModel.update(customerTable.name, customerTable.columns.customerID, id, ["deleted"], [true]);
                if (!deleted) {
                    statusCode = 404
                    throw new Error("Delete customer fail");
                }
                return deleted
            })

            return handleResponse(res, 200, { data: result })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    },

    getAll: async (req, res) => {
        let statusCode
        try {
            const customerList = await baseModel.findAllWithPhone("Customer");

            if (!customerList || customerList.length === 0) {
                statusCode = 404
                throw new Error("No records of customer");
            }

            return handleResponse(res, 200, { customerList: customerList })
        } catch (error) {
            return handleError(res, statusCode, error);
        }
    }

}

module.exports = customerController;