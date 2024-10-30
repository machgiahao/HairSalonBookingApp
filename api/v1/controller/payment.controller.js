const paymentTable = require("../../../model/table/payment.table");
const baseModel = require("../../../model/base.model");
const vietQRConfig = require("../../../config/vietQR.config");
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

      let tmnCode = "CENWEP1D"; //vnPayConfig.VNP_TMNCODE;
      let secretKey = "7W6HDU281KXA8RTIC6VFOLLM20SMS5KU"; //vnPayConfig.VNP_HASHSECRET;
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
        locale = "vn";
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
      var vnp_Params = req.query;
      var secureHash = vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = sortObject(vnp_Params);
      var tmnCode = vnPayConfig.VNP_TMNCODE;
      var secretKey = vnPayConfig.VNP_HASHSECRET;

      var querystring = require("qs");
      var signData = querystring.stringify(vnp_Params, { encode: false });
      var crypto = require("crypto");
      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

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
  vnpayIpn: async (res, req, next) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];
    let orderId = vnp_Params["vnp_TxnRef"];
    let rspCode = vnp_Params["vnp_ResponseCode"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = vnPayConfig.VNP_HASHSECRET;
    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");

    let paymentStatus = "0"; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

    let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
    if (secureHash === signed) {
      //kiểm tra checksum
      if (checkOrderId) {
        if (checkAmount) {
          if (paymentStatus == "0") {
            //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
            if (rspCode == "00") {
              //thanh cong
              //paymentStatus = '1'
              // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
              res.status(200).json({ RspCode: "00", Message: "Success" });
            } else {
              //that bai
              //paymentStatus = '2'
              // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
              res.status(200).json({ RspCode: "00", Message: "Success" });
            }
          } else {
            res
              .status(200)
              .json({
                RspCode: "02",
                Message: "This order has been updated to the payment status",
              });
          }
        } else {
          res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
        }
      } else {
        res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }
    } else {
      res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
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
  generateQR: async (req, res) => {
    try {
      const Bank_ID = vietQRConfig.BANK_ID;
      const Account_No = vietQRConfig.ACCOUNT_NO;
      const Account_Name = vietQRConfig.ACCOUNT_NAME;

      const { Amount, Description } = req.body;
      let QR = `https://img.vietqr.io/image/${Bank_ID}-${Account_No}-compact2.png?amount=${Amount}&addInfo=${Description}&accountName=${Account_Name}`;
      res.status(200).json({
        success: true,
        qrCode: QR,
      });
    } catch (error) {
      console.error("Error", error);
      res.status(500).json({
        success: false,
        msg: "Cannot create QR code",
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
