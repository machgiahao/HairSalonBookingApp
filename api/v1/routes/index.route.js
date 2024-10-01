
// const systemConfig = require("../../../config/system.config");  
const staffRoute = require("./staff/staff.route");
const stylistRoute = require("./staff/stylist.route");

module.exports = ( app ) => {
    //STAFF
    app.use("/api/v1"+`/staff`,staffRoute);
    //STYLIST
    app.use("/api/v1"+`/stylist`,stylistRoute);
}