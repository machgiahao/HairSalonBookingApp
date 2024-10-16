const keyUtils = require("../helper/keyUtils.helper");
const pool = require("../config/connection");
const { Client } = require("pg");
pool.connect();

const queryModel = {
    executeTransaction: async (queries) => {
        try {
            await pool.query('BEGIN'); // Bắt đầu transaction

            let results = [];

            // Thực thi từng truy vấn trong danh sách
            for (let i = 0; i < queries.length; i++) {
                const { text, values } = queries[i];
                const result = await queryModel.executeQuery(text, values ); // Thực hiện truy vấn
                results.push(result.rows); // Lưu kết quả của từng truy vấn
            }

            await pool.query('COMMIT'); // Commit nếu không có lỗi
            return results; // Trả về kết quả của tất cả truy vấn
        } catch (error) {
            await pool.query('ROLLBACK'); // Rollback nếu có lỗi
            throw error; // Ném lỗi ra ngoài để controller xử lý
        } finally {
            pool.release(); // Giải phóng kết nối
        }
    },
    
    create: async (tableName, columns) => {
        try {
            const keyArr = keyUtils.getKeysAsArray(columns);
            const setColumns = keyArr.join(", ");
            const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
            const query = `INSERT INTO "${tableName}" (${setColumns}) VALUES (${placeholders}) RETURNING *`;
            return query;
        } catch (error) {
            console.error("Error executing create:", error);
            throw error
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
    },
    find: async (tableName, columns = ["*"], { limit, skip } = {}) => {
        try {
          const setColumns = columns.join(", ");
          let query = `SELECT ${setColumns} FROM "${tableName}"`;
    
    
          if (limit && skip !== undefined) {
            const clause = `
            LIMIT $${1} 
            OFFSET $${2}`;
            query += clause;
          }
    
          // return (await pool.query(query, values)).rows;
          return query;
        } catch (error) {
          console.error("Error executing pagination query:", error);
          throw new Error(`Pagination operation failed: ${error.message}`);
        }
      },
    
      countDocuments: async (tableName) => {
        try {
          const query = `SELECT COUNT(*) FROM "${tableName}"`;
          // return rows[0].count;
          return query;
        } catch (error) {
          console.error("Error executing countDocuments:", error);
          throw new Error(`Count operation failed: ${error.message}`);
        }
      },

      findWithConditionsJoin:  (
        tableName,
        columns = ["*"],
        conditions = [],
        logicalOperators = ["AND"],
        joins = []
    ) => {
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
                let flag=0;
                conditions.forEach((condition, index) => {
                    const { column, operator = "=" } = condition;
    
                    
                        if (operator == "BETWEEN" ) {
                            // Handle BETWEEN condition
                            whereClauses.push(`"${column}" BETWEEN $${flag+ 1} AND $${flag+ 2}`);
                            flag+=2;
                        } else {
                            whereClauses.push(`"${column}" ${operator} $${flag+ 1}`);
                            flag+=1;
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
    
            
          //   const result = await pool.query(query, values);
          //   return result.rows;
          return query;
        } catch (error) {
            console.error("Error executing findWithConditions:", error);
            throw new Error(`Find with conditions failed: ${error.message}`);
        }
    },
    
    
      findById:  (tableName, idColumn) => {
        try {
          const query = `SELECT * FROM "${tableName}" WHERE "${idColumn}" = $1`;
        //   const result = await pool.query(query, [idValue]);
          // return result.rows[0];
          return query;
        } catch (error) {
          console.error("Error executing findById:", error);
          throw new Error(`Find by ID operation failed: ${error.message}`);
        }
      },
    
      findByPhone:  (tableName, phoneColumn) => {
        try {
          const query = `SELECT * FROM "${tableName}" WHERE "${phoneColumn}" = $1`;
          // return result.rows[0];
          return query;
        } catch (error) {
          console.error("Error executing findByPhone:", error);
          throw new Error(`Find by phone operation failed: ${error.message}`);
        }
      },
    
      findByField:  (tableName, columnName) => {
        try {
          const query = `SELECT * FROM "${tableName}" WHERE "${columnName}" = $1`;
         // return result.rows[0];
         return query;
        } catch (error) {
          console.error("Error executing findByPhone:", error);
          throw new Error(`Find by phone operation failed: ${error.message}`);
        }
      },
    
      deleteWithConditions:  (tableName, { conditions = [], logicalOperator = " AND " } = {}) => {
        try {
          if (conditions.length === 0) return false;
    
          let query = `DELETE FROM "${tableName}" WHERE `;
          const whereClauses = [];
    
          conditions.forEach((element, i) => {
            const { column, operator = "=" } = element;
            whereClauses.push(`${column} ${operator} $${i + 1}`);
          });
    
          query += whereClauses.join(logicalOperator);
    
          //return result.rowCount;
          return query;
        } catch (error) {
          console.error("Error executing delete:", error);
          throw new Error(`Delete operation failed: ${error.message}`);
        }
      },
    
      findAllWithPhone:  (roleTable) => {
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
    
          // return result.rows;
          return query;
        } catch (err) {
          console.error("Error executing delete:", error);
          throw new Error(`Delete operation failed: ${error.message}`);
        }
      }, 
      
}
module.exports = queryModel;


  
  
  