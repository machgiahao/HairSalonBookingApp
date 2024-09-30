const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const baseModel = require("../../../../model/base.model");
const validate = require("../../../../validates/validateInput");
const roleHelper = require("../../../../helper/role.helper");

const authController = {
    register: async (req, res) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            const validateError = validate.validateInput(req.body);
            if (validateError) {
                return res.status(400).json({
                    success: "fail",
                    msg: validateError
                });
            }
            // hash password
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.Password, salt);

            // Create user 
            const newUser = {
                Avatar: req.body.Avatar,
                Role: req.body.Role || "Customer",
                Email: req.body.Email,
                Password: hashed,
                PhoneNumber: req.body.PhoneNumber,
            }
            const user = await baseModel.create("Users", Object.keys(newUser), Object.values(newUser));
            const userByRole = await roleHelper.handleRole(user, req.body);
            
            return res.status(200).json({
                success: true,
                data: {
                    user: user,
                    userByRole: userByRole
                }
            });
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: "fail",
                msg: "Ịntenal server error"
            })
        }
    },

    login: async (req, res) => {
        
    }


}

module.exports = authController;