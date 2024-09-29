const pool = require("../../../config/connection");
const { getKeysAsArray } = require('../../../../helpers/keyUtils');
pool.connect();

const baseModel = {
    
    // Count documents
    countDocuments: async (tableName) => {
        try {
          const query = `SELECT COUNT(*) FROM ${tableName}`;
          const rows = (await pool.query(query)).rows;
          return rows[0].count;
        } catch (error) {
          console.error("Error executing countDocuments:", error);
          throw new Error(`Count operation failed: ${error.message}`);
        }
      },

    // Create
    create: async (tableName, columns, values) => {
        try {
            const keyArr = getKeysAsArray(columns);
            const setColumns = keyArr.join(", ");
            const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
            const query = `INSERT INTO "${tableName}" (${setColumns}) VALUES (${placeholders}) RETURNING *`;

            const result = await pool.query(query, values);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error("Error executing create:", error);
            throw new Error(`Create operation failed: ${error.message}`);
        }
    }
}
module.exports = baseModel;