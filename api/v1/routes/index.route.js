const authRoute = require("./auth.route.js");

module.exports = (app) => {
    app.use("/api/v1/auth", authRoute)
}



