
const systemConfig = require("../../../config/system.config");  
const staffRoute = require("./staff/staff.route")

module.exports = ( app ) => {
    //STAFF
    app.use(systemConfig.prefixPath+`/staff`,staffRoute);
    //STYLIST
    // app.use(systemConfig.prefixPath+`/stylist`,sylistRoute)
}