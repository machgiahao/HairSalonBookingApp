const baseModel = require("../../../../model/base.model")

const customerController = {
    detail: async (req, res) => {
        try {
            const id = req.params.id;
            console.log(id)
            if (!id) {
                return res.status(400).json({
                    success: "fail",
                    msg: "ID is required"
                })
            }
            const customer = await baseModel.findById("Customer", "CustomerID", id);
            if (!customer) {
                return res.status(400).json({
                    success: "fail",
                    msg: "Customer not found"
                })
            }
            return res.status(200).json({
                success: "true",
                customer: customer
            })

        } catch (error) {
            return res.status(500).json({
                success: "fail",
                msg: "Internal server error"
            })
        }
    },

    update: async (req, res) => {
        try {
            const id = req.params.id;

            if(!id) {
                return res.status(400).json({
                    success: "fail",
                    msg: "ID is required"
                })
            }
            
            const customer = {
                FullName: req.body.fullName
            }        
            const update = await baseModel.update("Customer", "CustomerID", id, Object.keys(customer), Object.values(customer));
            if (!update) {
                return res.status(404).json({ error: 'Staff member not found' });
            }
            res.status(200).json({
                success: "true",
                msg: "Update successfully"
            })
        } catch (error) {
            return res.status(500).json({
                success: "fail",
                msg: "Internal server error"
            })
        }
    }, 


}


module.exports = customerController;