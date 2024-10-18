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

      res.status(200).json({
        success: true,
        paymentList: paymentList,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: "Internal server error",
      });
    }
  },
  getDetail: async (req, res) => {
    const id = req.query.id;
    try {
      const paymentDetail = await baseModel.findById(
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

      for (const key in req.body) {
        if (paymentTable.columns[key] !== undefined && req.body[key] != "") {
          columns.push(paymentTable.columns[key]);
          values.push(req.body[key]);
        }
      }

      const newPayment = await baseModel.create("Payment", columns, values);
      return res.status(200).json({
        success: true,
        data: newPayment,
      });
    } catch (error) {
      console.log(error);
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
