const keyUtils = require("../helper/keyUtils.helper");
const pool = require("../config/connection");
const { Client } = require("pg");
pool.connect();

const queryModel = {
    create: async (tableName, columns) => {
        try {
            const keyArr = keyUtils.getKeysAsArray(columns);
            const setColumns = keyArr.join(", ");
            const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
            const query = `INSERT INTO "${tableName}" (${setColumns}) VALUES (${placeholders}) RETURNING *`;
            return query;
        } catch (error) {
            console.error("Error executing create:", error);
            throw new Error(`Create operation failed: ${error.message}`);
        }
    },

    update: async (tableName, idColumn, columns) => {
        try {
            // Check if columns are populated
            if (columns.length === 0) {
                throw new Error("No columns provided for the update operation.");
            }

            const setClause = columns
                .map((col, i) => `"${col}" = $${i + 1}`) // safely create SET clause
                .join(", ");

            const query = `UPDATE "${tableName}" SET ${setClause} WHERE "${idColumn}" = $${columns.length + 1} RETURNING *`;
            return query;
        } catch (error) {
            console.error("Error executing update:", error);
            throw new Error(`Update operation failed: ${error.message}`);
        }
    },

    deleteById: async (tableName, idColumn) => {
        try {
            const query = `DELETE FROM "${tableName}" WHERE "${idColumn}" = $1`;
            return query;
        } catch (error) {
            console.error("Error executing delete:", error);
            throw new Error(`Delete operation failed: ${error.message}`);
        }
    },

    executeQuery: async (query, values) => {
        try {
            const result = await Client.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("Error executing delete:", error);
            throw new Error(`Delete operation failed: ${error.message}`);
        }
    }
}
module.exports = queryModel;