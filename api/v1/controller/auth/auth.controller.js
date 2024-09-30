const bcrypt = require("bcrypt");
const baseModel = require("../../../../model/base.model");
const validate = require("../../../../validates/validateInput");
const generate = require("../../../../helper/generate.helper")
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
        try {
            const phoneNumber = req.body.PhoneNumber;
            
            const  validatePhoneError = validate.validateInputField(phoneNumber);
            if(validatePhoneError) {
                return res.status(400).json({
                    success: "fail",
                    msg: validatePhoneError
                })
            }
            const user = await baseModel.findByPhone("Users", "PhoneNumber", phoneNumber);
            console.log(user)
            if(!user) {
                return res.status(401).json({
                    success: "fail",
                    msg: "Phone number not registed !"
                })
            }
            const password = req.body.Password;
            if (!password) {
                return res.status(400).json({
                    success: "fail",
                    msg: "Password is required!"
                });
            }
            const validPassword = await bcrypt.compare(password, user.Password);
            if(!validPassword) {
                return res.status(401).json({
                    success: "fail",
                    msg: "Incorrect password !"
                })
            }
            // Generate Token
            const accessToken = generate.generateAccessToken(user);
            const refreshToken = generate.generateRefreshToken(user);
            // Save refresh token in DB
            await baseModel.update("Users", "PhoneNumber", user.PhoneNumber, ["RefreshToken"], [refreshToken]);
            // Save refresh token in cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict"
            });
            // Get additional information based on user role
            const tableByRole = roleHelper.getTableByRole(user);
            const actorByRole = await baseModel.findById(tableByRole, "UserID", user.UserID);  

            const { Password, RefreshToken,...others} = user;
            return res.status(200).json({
                success: "true",
                actor: actorByRole,
                records: {...others, accessToken}
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: "fail",
                msg: "Ịnternal server error"
            })
        }
    }


}

module.exports = authController;