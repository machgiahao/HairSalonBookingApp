const baseModel = require("../../../model/base.model")
const customerTable = require("../../../model/table/customer.table")

const customerController = {
    detail: async (req, res) => {
        try {
            const id = req.query.id;

            const customer = await baseModel.findById("Customer", "customerID", id);
            if (!customer) {
                return res.status(400).json({
                    success: false,
                    msg: "Customer not found"
                })
            }
            return res.status(200).json({
                success: true,
                customer: customer
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
            
            const columns = [];
            const values = [];

            for (const key in req.body) {
                if (customerTable.columns[key] !== undefined && req.body[key] !== "" ) {  // Ensure the key is a valid column
                    columns.push(customerTable.columns[key]);
                    if (key === 'loyaltyPoints') {
                        values.push(parseFloat(req.body[key]));  
                    } else {
                        values.push(req.body[key]);  
                    }
                }
            }

            const update = await baseModel.update(customerTable.name, customerTable.columns.customerID, id, columns, values);
            if (!update) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            res.status(200).json({
                success: true,
                msg: "Update successfully",
                data: update
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: "Internal server error"
            })
        }
    }, 

    delete: async (req, res) => {
        try {
            const id = req.query.id;

            const customer = {
                deleted: true
            }        
            const update = await baseModel.update("Customer", "customerID", id, Object.keys(customer), Object.values(customer));
            if (!update) {
                return res.status(404).json({ 
                    success: false, 
                    msg: "Delete fail" });
            }
            res.status(200).json({
                success: true,
                msg: "Delete successfully",
                data: update
            })
            
        } catch (error) {
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