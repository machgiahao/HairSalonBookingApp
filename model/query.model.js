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
  find:  (tableName, columns = ["*"], { limit, skip } = {}) => {
    try {
        const setColumns = columns.join(", ");
        let query = `SELECT ${setColumns} FROM "${tableName}"`;

        if (limit && skip !== undefined) {
            const clause = `
            LIMIT $${1} 
            OFFSET $${2}`;
            query += clause;
        }
        return query;
    } catch (error) {
        console.error("Error executing pagination query:", error);
        throw error; 
    }
},
countDocuments:  (tableName) => {
    try {
        const query = `SELECT COUNT(*) FROM "${tableName}"`;
        return query;
    } catch (error) {
        console.error("Error executing countDocuments:", error);
        throw error; 
    }
},
findWithConditionsJoin: (tableName, columns = ["*"], conditions = [], logicalOperators = ["AND"], joins = []) => {
    try {
        const setColumns = columns.join(", ");
        let query = `SELECT ${setColumns} FROM "${tableName}"`; 
        const whereClauses = [];

        // Handle joins
        joins.forEach((join) => {
            const { table, on, type = "INNER" } = join; // Default to INNER JOIN
            query += ` ${type} JOIN "${table}" ON ${on}`;
        });

        if (conditions.length > 0) {
            let flag = 0;
            conditions.forEach((condition, index) => {
                const { column, operator = "=" } = condition;

                if (operator == "BETWEEN") {
                    // Handle BETWEEN condition
                    whereClauses.push(`"${column}" BETWEEN $${flag + 1} AND $${flag + 2}`);
                    flag += 2;
                } else {
                    whereClauses.push(`"${column}" ${operator} $${flag + 1}`);
                    flag += 1;
                }

                // Add logical operator if it's not the last condition
                if (index < conditions.length - 1) {
                    whereClauses.push(` ${logicalOperators[index] || "AND"} `);
                }
            });

            if (whereClauses.length > 0) {
                query += ` WHERE ${whereClauses.join("")}`;
            }
        }

        return query;
    } catch (error) {
        console.error("Error executing findWithConditions:", error);
        throw error; 
    }
},
findById: (tableName, idColumn) => {
    try {
        const query = `SELECT * FROM "${tableName}" WHERE "${idColumn}" = $1`;
        return query;
    } catch (error) {
        console.error("Error executing findById:", error);
        throw error;
    }
},

findByPhone: (tableName, phoneColumn) => {
    try {
        const query = `SELECT * FROM "${tableName}" WHERE "${phoneColumn}" = $1`;
        return query;
    } catch (error) {
        console.error("Error executing findByPhone:", error);
        throw error; 
    }
},

findByField: (tableName, columnName) => {
    try {
        const query = `SELECT * FROM "${tableName}" WHERE "${columnName}" = $1`;
        return query;
    } catch (error) {
        console.error("Error executing findByField:", error);
        throw error; 
    }
},

deleteWithConditions: (tableName, { conditions = [], logicalOperator = " AND " } = {}) => {
    try {
        if (conditions.length === 0) return false;

        let query = `DELETE FROM "${tableName}" WHERE `;
        const whereClauses = [];

        conditions.forEach((element, i) => {
            const { column, operator = "=" } = element;
            whereClauses.push(`${column} ${operator} $${i + 1}`);
        });

        query += whereClauses.join(logicalOperator);
        return query;
    } catch (error) {
        console.error("Error executing delete:", error);
        throw error; 
    }
},

findAllWithPhone: (roleTable) => {
    try {
        const query = `
            SELECT 
                r.*,  -- Lấy tất cả các cột của bảng Customer
                u."phoneNumber"  -- Lấy cột phoneNumber của bảng Users
            FROM 
                "${roleTable}" r
            JOIN 
                "Users" u 
            ON 
                r."userID" = u."userID";
        `;

        return query;
    } catch (err) {
        console.error("Error executing findAllWithPhone:", err);
        throw error; 
    }
},
}

module.exports = queryModel;
