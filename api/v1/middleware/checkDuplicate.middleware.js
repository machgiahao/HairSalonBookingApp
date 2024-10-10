const baseModel = require("../../../model/base.model");


const checkDuplicateMiddleware = async (req, res, next) => {
    try {
        const { phoneNumber, email } = req.body;

        // Check exist phone number
        const checkPhone = await baseModel.findByField("Users", "phoneNumber", phoneNumber);
        if (checkPhone) {
            return res.status(400).json({
                success: false,
                msg: "Phone number already exist"
            })
        }

        // Check exist email
        const checkEmail = await baseModel.findByField("Users", "email", email);
        if (checkEmail) {
            return res.status(400).json({
                success: false,
                msg: "Email already exist"
            })
        }

        next();

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: "Internal server error"
        })
    }
}

module.exports = checkDuplicateMiddleware