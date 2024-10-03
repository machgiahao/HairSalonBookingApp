const baseModel = require("../../../../model/base.model")

const customerController = {
    detail: async (req, res) => {
        try {
            const id = req.params.id;
            console.log(id)
            if(!id) {
                return res.status(400).json({
                    success: "fail",
                    msg: "ID is required"
                })
            }
            const customer = await baseModel.findById("Customer", "CustomerID", id);
            if(!customer) {
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
 }
}


module.exports = customerController;