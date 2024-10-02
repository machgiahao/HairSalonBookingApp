const authRoute = require("./auth/auth.route")
const staffRouter = require("./staff/staff.route");

module.exports = (app) => {
    app.use("/api/v1/auth", authRoute);

    //STAFF ROUTE
    app.use("/api/v1/staff",staffRouter);

    //STYLIST ROUTE
    app.use("/api/v1/stylist",(req,res)=>{res.send('stylist')});
    
}



