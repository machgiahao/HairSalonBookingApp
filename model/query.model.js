const keyUtils = require("../helper/keyUtils.helper");
const pool = require("../config/connection");

const queryModel = {
  executeTransaction: async (transactionCallback) => {
    const client = await pool.connect(); // Lấy một client từ pool
    try {
      await client.query('BEGIN'); // Bắt đầu transaction
      const result = await transactionCallback(client); // Truyền client vào callback để thực hiện các query
      await client.query('COMMIT'); // Commit transaction nếu thành công
      return result;
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback nếu có lỗi xảy ra
      throw error;
    } finally {
      client.release(); // Đảm bảo giải phóng client sau khi sử dụng
    }
  },

  create: async (tableName, columns, values, client) => {
    try {
      const keyArr = keyUtils.getKeysAsArray(columns);
      const setColumns = keyArr.join(", ");
      const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
      const query = `INSERT INTO "${tableName}" (${setColumns}) VALUES (${placeholders}) RETURNING *`;
      const result = await client.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error executing create:", error);
      throw new Error(`Create operation failed: ${error.message}`);
    }
  },

  update: async (tableName, idColumn, idValue, columns, values, client) => {
    try {
      // Check if columns are populated
      if (columns.length === 0) {
        throw new Error("No columns provided for the update operation.");
      }

      const setClause = columns
        .map((col, i) => `"${col}" = $${i + 1}`) // safely create SET clause
        .join(", ");

      const query = `UPDATE "${tableName}" SET ${setClause} WHERE "${idColumn}" = $${columns.length + 1} RETURNING *`;

      // // Log the query and values for debugging
      // console.log("Generated query:", query);
      // console.log("Values:", [...values, idValue]);

      // Execute the query
      const result = await client.query(query, [...values, idValue]);

      return result.rows[0];
    } catch (error) {
      console.error("Error executing update:", error);
      throw new Error(`Update operation failed: ${error.message}`);
    }
  },

  deleteById: async (tableName, idColumn, idValue, client) => {
    try {
      const query = `DELETE FROM "${tableName}" WHERE "${idColumn}" = $1`;
      await client.query(query, [idValue]);
      return true;
    } catch (error) {
      console.error("Error executing delete:", error);
      throw new Error(`Delete operation failed: ${error.message}`);
    }
  },
}
module.exports = queryModel;