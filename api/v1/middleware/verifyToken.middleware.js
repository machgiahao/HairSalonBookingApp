const jwt = require("jsonwebtoken")

const verifyToken = async (req, res, next) => {
    const token = req.headers.token;
    if (token) {
        const accessToken = token.split(" ")[1];
        jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    msg: "Token is not valid"
                })
            }
            req.user = user;
            next();
        })
    } else {
        return res.status(401).json("You're not authenticated")
    }
}

const checkRole = (requiredRole) => {
    return (req, res, next) => {
        const { role } = req.user;

        if (role !== requiredRole) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        next();
    };
};


module.exports = {verifyToken, checkRole};