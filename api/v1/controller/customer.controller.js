const baseModel = require("../../../model/base.model")
const customerTable = require("../../../model/table/customer.table")
const userTable = require("../../../model/table/user.table")

const customerController = {
    detail: async (req, res) => {
        try {
            const id = req.query.id;

            const customer = await baseModel.findByField(customerTable.name, customerTable.columns.customerID, id);
            if (!customer) {
                return res.status(400).json({
                    success: false,
                    msg: "Customer not found"
                })
            }

            const user = await baseModel.findByField(userTable.name, userTable.columns.userID, customer.userID);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    msg: "User not found"
                })
            }

            return res.status(200).json({
                success: true,
                data: {
                    customer: customer,
                    user: user
                }
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    },
    update: async (req, res) => {
        try {
            const id = req.query.id;

            const result = await baseModel.executeTransaction(async () => {
                const CustomerColumns = [];
                const CustomerValues = [];
                const UserColumns = [];
                const UserValues = [];

                for (const key in req.body) {
                    // Kiểm tra và xử lý các cột cho bảng Customer
                    if (customerTable.columns[key] !== undefined && req.body[key] !== "") {
                        CustomerColumns.push(customerTable.columns[key]);
                        if (key === 'loyaltyPoints') {
                            CustomerValues.push(parseFloat(req.body[key]));
                        } else {
                            CustomerValues.push(req.body[key]);
                        }
                    }

                    // Kiểm tra và xử lý các cột cho bảng Users
                    if (userTable.columns[key] !== undefined && req.body[key] !== "") {
                        UserColumns.push(userTable.columns[key]);
                        UserValues.push(req.body[key]);
                    }
                }

                // Cập nhật bảng Customer
                const updateCustomer = await baseModel.update(customerTable.name, customerTable.columns.customerID, id, CustomerColumns, CustomerValues);
                if (!updateCustomer) {
                    return res.status(404).json({ error: 'Customer not found' });
                }

                // Cập nhật bảng Users 
                const userId = req.body.userID;
                const updateUser = await baseModel.update(userTable.name, userTable.columns.userID, userId, UserColumns, UserValues);
                if (!updateUser) {
                    return res.status(404).json({ error: 'User not found' });
                }

                return { updateCustomer: updateCustomer, updateUser: updateUser }
            })

            res.status(200).json({
                success: true,
                msg: "Update successfully",
                data: {
                    updateManager: result.updateManager,
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