const { getColsVals } = require("../../../helper/getColsVals.helper");
const baseModel = require("../../../model/base.model")
const customerTable = require("../../../model/table/customer.table")
const userTable = require("../../../model/table/user.table")

const customerController = {
    detail: async (req, res) => {
        try {
            const id = req.query.id;

            const customer = await baseModel.findByField(customerTable.name, customerTable.columns.customerID, id);
            if (!customer) {
                throw new Error("Customer not found");
                
            }

            const user = await baseModel.findByField(userTable.name, userTable.columns.userID, customer.userID);
            if (!user) {
                throw new Error("User not found");
                
            }
            const { password, refreshToken, ...others } = user;
            return res.status(200).json({
                success: true,
                data: {
                    customer: customer,
                    user: others
                }
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    },
    update: async (req, res) => {
        try {
            const id = req.query.id;

            const result = await baseModel.executeTransaction(async () => {
                const { columns: customerColumns, values: customerValues } = getColsVals(customerTable, req.body);
                const { columns: userColumns, values: userValues } = getColsVals(userTable, req.body);
                // Update table customer
                const updateCustomer = await baseModel.update(customerTable.name, customerTable.columns.customerID, id, customerColumns, customerValues);
                if (!updateCustomer) {
                    throw new Error("Customer not found");               
                }
                // Update table user
                const userId = req.body.userID;
                const updateUser = await baseModel.update(userTable.name, userTable.columns.userID, userId, userColumns, userValues);
                if (!updateUser) {
                    return res.status(404).json({ error: 'User not found' });
                }
                const { refreshToken, password, ...others } = updateUser;
                return { updateCustomer: updateCustomer, updateUser: others }
            })

            res.status(200).json({
                success: true,
                msg: "Update successfully",
                data: {
                    updateCustomer: result.updateCustomer,
                    updateUser: result.updateUser
                }
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    delete: async (req, res) => {
        try {
            const id = req.query.id;

            const result = await baseModel.executeTransaction(async () => {
                const deleted = await baseModel.update(customerTable.name, customerTable.columns.customerID, id, ["deleted"], [true]);
                if (!deleted) {
                    return res.status(404).json({
                        success: false,
                        msg: "Delete fail"
                    });
                }
                return deleted
            })

            res.status(200).json({
                success: true,
                msg: "Delete successfully",
                data: result
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },

    getAll: async (req, res) => {
        try {
            const customerList = await baseModel.findAllWithPhone("Customer");

            if (!customerList || customerList.length === 0) {
                return res.status(404).json({
                    success: false,
                    msg: 'No customer found'
                });
            }

            res.status(200).json({
                success: true,
                customerList: customerList
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    }

}

module.exports = customerController;