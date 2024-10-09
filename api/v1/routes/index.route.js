const authRoute = require("./auth.route");
const customerRoute = require("./customer.route");
const userRoute = require("./user.route");
const staffRouter = require("./staff.route");
const stylistRouter = require("./stylist.route");
const workshipRouter = require("./workshift.route");

module.exports = (app) => {
    app.use("/api/v1/auth", authRoute);
  
    //USER ROUTE
    app.use("/api/v1/user", userRoute);

    //CUSTOMER ROUTE
    app.use("/api/v1/customer", customerRoute);

    //STAFF ROUTE
    app.use("/api/v1/staff",staffRouter);

    //STYLIST ROUTE
    app.use("/api/v1/stylist",stylistRouter);

    //STYLIST ROUTE
    app.use("/api/v1/workshift",workshipRouter);
    
    
}



