const baseModel = require("../../../../model/base.model")

const customerController = {
    detail: async (req, res) => {
        try {
            const id = req.params.id;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    msg: "ID is required"
                })
            }
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
            const id = req.params.id;
            
            if(!id) {
                return res.status(400).json({
                    success: false,
                    msg: "ID is required"
                })
            }
            
            const customer = {
                fullName: req.body.fullName,
                avatar: req.body.avatar,
                email: req.body.email,
                loyaltyPoints: req.body.loyaltyPoints,
            }        
            const update = await baseModel.update("Customer", "customerID", id, Object.keys(customer), Object.values(customer));
            if (!update) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            res.status(200).json({
                success: true,
                msg: "Update successfully"
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
            const id = req.params.id;

            if(!id) {
                return res.status(400).json({
                    success: false,
                    msg: "ID is required"
                })
            }
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
                msg: "Delete successfully"
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
            const customerList = await baseModel.findWithConditions(
                "Customer", undefined, 
                { 
                  conditions: [{ column: "deleted", value: false }],
                }
              );

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