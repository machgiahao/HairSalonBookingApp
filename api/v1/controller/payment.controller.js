const paymentTable = require("../../../model/table/payment.table");
const baseModel = require("../../../model/base.model");
const vietQRConfig = require("../../../config/vietQR.config");

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

      columns.push("bookingID");
      values.push(req.body.bookingID);
      columns.push("status");
      values.push(req.body.status);
      columns.push("method");
      values.push(req.body.method);

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
  generateVietQR: async (req,res) => {
    try {
      const { Amount, Description } = req.body;
      const bodyrequest = {
        accountNo: vietQRConfig.ACCOUNT_NO,
        accountName: vietQRConfig.ACCOUNT_NAME,
        acqId: vietQRConfig.ACQID,
        amount: Amount,
        addInfo: Description,
        format: "text",
        template: "compact"
      }
      console.log(bodyrequest);
      const response = await fetch("https://api.vietqr.io/v2/generate", {
        method: "POST",
        headers: {
          "x-client-id": vietQRConfig.VIETQR_CLIENT_ID, 
          "x-api-key": vietQRConfig.VIETQR_API_KEY,     
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyrequest),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  }
  ,
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
