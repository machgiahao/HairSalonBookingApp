const paymentTable = require("../../../model/table/payment.table");
const baseModel = require("../../../model/base.model");
const vnPayConfig = require("../../../config/vnpay.config");
const sortObject = require("../../../helper/sortObjectVnPay.helper");

const paymentController = {
  getAll: async (req, res) => {
    try {
      const paymentList = await baseModel.find("Payment");

      if (!paymentList || paymentList.length === 0) {
        return res.status(404).json({
          success: false,
          msg: "No payment found",
        });
      }

      const paymentDetailsWithTotalPrice = await Promise.all(
        paymentList.map(async (paymentDetail) => {
          const bookingID = paymentDetail.bookingID;
          const bookingInfo = await baseModel.findById(
            "Booking",
            "bookingID",
            bookingID
          );

          return {
            ...paymentDetail,
            totalPrice: bookingInfo ? bookingInfo.totalPrice : 0,
          };
        })
      );

      res.status(200).json({
        success: true,
        paymentList: paymentDetailsWithTotalPrice,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        msg: "Internal server error",
      });
    }
  },

  createPaymentUrl: async (req, res, next) => {
    try {
      console.log(req.body);
      const returnURL = req.body.returnURL;
      console.log(returnURL);
      let date = new Date();
      let createDate = date
        .toISOString()
        .replace(/[-:]/g, "")
        .substring(0, 15)
        .replace("T", "");
      console.log(createDate);
      console.log("Day ne");
      let ipAddr =
        req.headers["x-forwarded-for"] || // Dùng cho proxy
        req.connection.remoteAddress || // Địa chỉ IP từ kết nối
        req.socket.remoteAddress || // Địa chỉ IP từ socket
        req.connection.socket.remoteAddress; // Địa chỉ IP từ socket kết nối
      console.log(ipAddr);
      let tmnCode = vnPayConfig.VNP_TMNCODE;
      let secretKey = vnPayConfig.VNP_HASHSECRET;
      console.log(secretKey);
      let vnpUrl = vnPayConfig.VNP_URL;
      let returnUrl = returnURL;

      function formatOrderId(date) {
        let day = String(date.getDate()).padStart(2, "0"); // Ngày (2 chữ số)
        let hours = String(date.getHours()).padStart(2, "0"); // Giờ (2 chữ số)
        let minutes = String(date.getMinutes()).padStart(2, "0"); // Phút (2 chữ số)
        let seconds = String(date.getSeconds()).padStart(2, "0"); // Giây (2 chữ số)

        return `${day}${hours}${minutes}${seconds}`; // Kết quả: "DDHHmmss"
      }

      let datet = new Date();
      let orderId = formatOrderId(datet);
      console.log(orderId); // Ví dụ: "30121130"
      let amount = req.body.amount;
      console.log(amount);
      let bankCode = req.body.bankCode;
      console.log(bankCode);

      let locale = req.body.language;
      if (locale === null || locale === "") {
        locale = "en";
      }
      let currCode = "VND";
      let vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      vnp_Params = sortObject(vnp_Params);
      let querystring = require("qs");
      let crypto = require("crypto");
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      console.log("Redirect URL: ", vnpUrl);
      res.status(200).json({
        success: true,
        link: vnpUrl,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        msg: "Internal server error",
      });
    }
  },
  returnUrl: async (req, res, next) => {
    try {
      let locale = "en";
      let currCode = "VND";
      console.log("vo vnpay return");
      var vnp_Params = req.query; // Lấy các tham số từ query string
      console.log(req.query);
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_IpAddr"] = "::1";
      console.log("Received parameters from VNPay:", vnp_Params); // Ghi log tham số nhận được
      var secureHash = vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      // Xử lý chữ ký và các thông tin khác
      vnp_Params = sortObject(vnp_Params);
      var secretKey = vnPayConfig.VNP_HASHSECRET;

      vnp_Params = sortObject(vnp_Params);
      let querystring = require("qs");
      let crypto = require("crypto");
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      console.log(signed);
      // Xác minh chữ ký
      if (secureHash === signed) {
        res.status(200).json({
          success: true,
          code: vnp_Params["vnp_ResponseCode"],
          message: "Transaction successful",
          data: vnp_Params,
        });
      } else {
        res.status(200).json({
          success: false,
          code: "97",
          message: "Invalid signature",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        msg: "Internal server error",
      });
    }
  },
  getDetail: async (req, res) => {
    const id = req.query.id;
    try {
      let paymentDetail = await baseModel.findById("Payment", "paymentID", id);

      if (!paymentDetail) {
        return res.status(400).json({
          success: false,
          msg: "Payment not found",
        });
      }
      let bookingID = paymentDetail.bookingID;
      const bookingInfo = await baseModel.findById(
        "Booking",
        "bookingID",
        bookingID
      );
      const totalPrice = bookingInfo.totalPrice;
      paymentDetail.totalPrice = totalPrice;

      return res.status(200).json({
        success: true,
        payment: paymentDetail,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        mgs: "Internal server error",
      });
    }
  },
  create: async (req, res) => {
    try {
      const columns = [];
      const values = [];

      if (!req.body.bookingID) {
        return res.status(400).json({
          success: false,
          msg: "bookingID is required",
        });
      }

      const booking = await baseModel.findAllByField(
        "Booking",
        "bookingID",
        req.body.bookingID
      );

      if (!booking || booking.length === 0) {
        return res.status(404).json({
          success: false,
          msg: "No booking found with the provided bookingID",
        });
      }

      const existingPayment = await baseModel.findAllByField(
        "Payment",
        "bookingID",
        req.body.bookingID
      );

      if (existingPayment.length > 0) {
        if (existingPayment[0].status === "unpaid") {
          return res.status(400).json({
            success: false,
            message:
              "Invalid request: This booking already has an associated payment.",
          });
        }
        if (existingPayment[0].status === "paid") {
          return res.status(400).json({
            success: false,
            msg: "This booking has already been paid",
          });
        }
      }

      if (!req.body.status) {
        columns.push("status");
        values.push("unpaid");
      }

      columns.push("bookingID");
      values.push(req.body.bookingID);

      const newPayment = await baseModel.create("Payment", columns, values);

      console.log(newPayment);
      return res.status(200).json({
        success: true,
        data: newPayment,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        msg: "Internal server error",
      });
    }
  },
  update: async (req, res) => {
    try {
      const id = req.query.id;

      const columns = [];
      const values = [];

      for (const key in req.body) {
        if (paymentTable.columns[key] !== undefined && req.body[key] !== "") {
          columns.push(paymentTable.columns[key]);
          values.push(req.body[key]);
        }
      }

      if (columns.length === 0) {
        return res.status(400).json({
          success: false,
          msg: "No valid data to update",
        });
      }

      const updatePayment = await baseModel.update(
        paymentTable.name,
        paymentTable.columns.paymentID,
        id,
        columns,
        values
      );

      if (!updatePayment) {
        return res.status(400).json({
          success: false,
          msg: "Payment not found",
        });
      }
      return res.status(200).json({
        success: true,
        msg: "Update successfully",
        data: updatePayment,
      });
    } catch (error) {
      console.error("Error in update:", error);
      return res.status(500).json({
        success: false,
        msg: "Internal server error",
        error: error.message,
      });
    }
  },
  softDel: async (req, res) => {
    try {
      const id = req.query.id;

      const payment = {
        deleted: true,
      };

      const update = await baseModel.update(
        "Payment",
        "paymentID",
        id,
        Object.keys(payment),
        Object.values(payment)
      );
      if (!update) {
        return res.status(404).json({
          success: false,
          msg: "Delete fail",
        });
      }
      res.status(200).json({
        success: true,
        msg: "Delete successfully",
        data: update,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: "Internal server error",
      });
    }
  },
};

module.exports = paymentController;
