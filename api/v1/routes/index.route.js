const authRoute = require("./auth/auth.route")

module.exports = (app) => {
    app.use("/api/v1/auth", authRoute);

    //STAFF ROUTE
    app.use("/api/v1/staff",(req,res)=>{res.send('staff')});

    //STYLIST ROUTE
    app.use("/api/v1/stylist",(req,res)=>{res.send('stylist')});
    
}



