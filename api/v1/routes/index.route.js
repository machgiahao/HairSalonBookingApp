const authRouter = require("./auth.route");
const customerRouter = require("./customer.route");
const userRouter = require("./user.route");
const staffRouter = require("./staff.route");
const stylistRouter = require("./stylist.route");
const managerRouter = require("./manager.route");
const serviceRouter = require("./service.route");
const workshiftRouter = require("./workshift.route");
const bookingRouter = require("./booking.route");
const salaryRouter = require("./salary.route");
const paymentRouter = require("./payment.route");
const newsRouter = require("./news.route");
const guestRouter = require("./guest.route");

module.exports = (app) => {
    app.use("/api/v1/auth", authRouter);

    //USER ROUTE
    app.use("/api/v1/guest", guestRouter);

    //GUEST ROUTE
    app.use("/api/v1/guest", userRouter);

    //CUSTOMER ROUTE
    app.use("/api/v1/customer", customerRouter);

    //MANAGER ROUTE
    app.use("/api/v1/manager", managerRouter);

    //STAFF ROUTE
    app.use("/api/v1/staff", staffRouter);

    //STYLIST ROUTE
    app.use("/api/v1/stylist", stylistRouter);

    //SERVICE
    app.use("/api/v1/service", serviceRouter);

    //STYLIST ROUTE
    app.use("/api/v1/workshift", workshiftRouter);

    //BOOKING ROUTE
    app.use("/api/v1/booking", bookingRouter);

    //SALARY ROUTE
    app.use("/api/v1/salary", salaryRouter);

    // PAYMENT ROUTE
    app.use("/api/v1/payment", paymentRouter);

    // NEWS ROUTE
    app.use("/api/v1/news", newsRouter);
}



