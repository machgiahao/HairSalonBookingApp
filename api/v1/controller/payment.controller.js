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
          const bookingInfo = await baseModel.findById("Booking", "bookingID", bookingID);
  
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
      let paymentDetail = await baseModel.findById(
        "Payment",
        "paymentID",
        id
      );

      if (!paymentDetail) {
        return res.status(400).json({
          success: false,
          msg: "Payment not found",
        });
      }
      let bookingID = paymentDetail.bookingID;
      const bookingInfo = await baseModel.findById("Booking", "bookingID", bookingID);
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
  
      const booking = await baseModel.findAllByField("Booking", "bookingID", req.body.bookingID);
  
      if (!booking || booking.length === 0) {
        return res.status(404).json({
          success: false,
          msg: "No booking found with the provided bookingID",
        });
      }
  
      const existingPayment = await baseModel.findAllByField("Payment", "bookingID", req.body.bookingID);

      if (existingPayment.length > 0) {
        if (existingPayment[0].status === 'unpaid') {
          return res.status(400).json({
            success: false,
            message: "Invalid request: This booking already has an associated payment.",
          });
        }
        if (existingPayment[0].status === 'paid') {
          return res.status(400).json({
            success: false,
            msg: "This booking has already been paid",
          });
        }
      }
  
      if (!req.body.status) {
        columns.push('status'); 
        values.push('unpaid'); 
      }

      columns.push('bookingID'); 
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
