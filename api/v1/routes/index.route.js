const authRoute = require("./auth/auth.route")
const customerRoute = require("./customer/customer.route")
const staffRouter = require("./staff/staff.route");
const stylistRouter = require("./staff/stylist.route");

module.exports = (app) => {
    app.use("/api/v1/auth", authRoute);

    //CUSTOMER ROUTE
    app.use("/api/v1/customer", customerRoute);

    //STAFF ROUTE
    app.use("/api/v1/staff",staffRouter);

    //STYLIST ROUTE
    app.use("/api/v1/stylist",stylistRouter);
    
}



