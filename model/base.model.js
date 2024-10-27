const keyUtils = require("../helper/keyUtils.helper");
const pool = require("../config/connection");
pool.connect();

const baseModel = {
  find: async (tableName, columns = ["*"], { limit, skip } = {}) => {
    try {
      const setColumns = columns.join(", ");
      let query = `SELECT ${setColumns} FROM "${tableName}"`;

      const values = [];

      if (limit && skip !== undefined) {
        const clause = `
        LIMIT $${values.length + 1} 
        OFFSET $${values.length + 2}`;
        query += clause;

        values.push(limit);
        values.push(skip);
      }

      return (await pool.query(query, values)).rows;
    } catch (error) {
      console.error("Error executing pagination query:", error);
      throw new Error(`Pagination operation failed: ${error.message}`);
    }
  },

  countDocuments: async (tableName) => {
    try {
      const query = `SELECT COUNT(*) FROM "${tableName}"`;
      const rows = (await pool.query(query)).rows;
      return rows[0].count;
    } catch (error) {
      console.error("Error executing countDocuments:", error);
      throw new Error(`Count operation failed: ${error.message}`);
    }
  },

  findWithConditions: async (
    tableName,
    columns = ["*"],
    conditions = [],
    logicalOperators = ["AND"],
    order = [],
    limit,
    offset,
  ) => {
    try {
      const setColumns = columns.join(", ");
      let query = `SELECT ${setColumns} FROM "${tableName}"`;
      const values = [];
      const whereClauses = [];
      let flag = 0;

      if (conditions.length > 0) {
        conditions.forEach((condition, index) => {
          const { column, value, operator = "=" } = condition;

          if (value !== undefined && value !== null) {
            whereClauses.push(`"${column}" ${operator} $${values.length + 1}`);
            values.push(value);

            if (index < conditions.length - 1) {
              whereClauses.push(` ${logicalOperators[index] || "AND"} `);
            }
          }
        });

        if (whereClauses.length > 0) {
          query += ` WHERE ${whereClauses.join("")}`;
        }
      }

      if (order.length > 0) {
        const orderByClauses = order.map((order) => {
          const { column, direction } = order
          return `"${column}" ${direction.toUpperCase()}`; e
        }).join(", ");
        query += ` ORDER BY ${orderByClauses}`;
      }

      if (limit) {
        query += ` LIMIT $${flag+ 1}`;
        values.push(limit);
      }

      if (offset) {
        query += ` OFFSET $${flag + 2}`;
        values.push(offset);
      }
      console.log(query);
      // Execute query
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error executing findWithConditions:", error);
      throw new Error(`Find with conditions failed: ${error.message}`);
    }
  },

  findWithConditionsJoin: async (
    tableName,
    columns = ["*"],
    conditions = [],
    logicalOperators = ["AND"],
    joins = [],
    order = [],
    limit,
    offset,
    groupBy = [] // New parameter for GROUP BY columns
) => {
    try {
        const setColumns = columns.join(", ");
        let query = `SELECT ${setColumns} FROM "${tableName}"`; 
        const values = [];
        const whereClauses = [];
        let flag = 0;

        if (joins.length > 0) {
            joins.forEach((join) => {
                const { table, on, type = "INNER" } = join; // Default to INNER JOIN
                query += ` ${type} JOIN "${table}" ON ${on}`;
            });
        }

        if (conditions.length > 0) {
            conditions.forEach((condition, index) => {
                const { column, value, operator = "=" } = condition;

                if (value !== undefined && value !== null) {
                    if (operator === "BETWEEN" && Array.isArray(value) && value.length === 2) {
                        // Handle BETWEEN condition
                        whereClauses.push(`"${column}" BETWEEN $${flag + 1} AND $${flag + 2}`);
                        values.push(value[0], value[1]); // Push both values for the BETWEEN clause
                        flag += 2;
                    } else {
                        whereClauses.push(`"${column}" ${operator} $${flag + 1}`);
                        values.push(value);
                        flag++;
                    }

                    // Add logical operator if it's not the last condition
                    if (index < conditions.length - 1) {
                        whereClauses.push(` ${logicalOperators[index] || "AND"} `);
                    }
                }
            });

            if (whereClauses.length > 0) {
                query += ` WHERE ${whereClauses.join("")}`;
            }
        }

        if (groupBy.length > 0) {
            const groupByClauses = groupBy.map(column => `${column}`).join(", ");
            query += ` GROUP BY ${groupByClauses}`;
        }

        if (order.length > 0) {
            const orderByClauses = order.map((order) => {
                const { column, direction } = order;
                return `"${column}" ${direction.toUpperCase()}`;
            }).join(", ");
            query += ` ORDER BY ${orderByClauses}`;
        }

        if (limit) {
            query += ` LIMIT $${flag + 1}`;
            values.push(limit);
        }

        if (offset) {
            query += ` OFFSET $${flag + 2}`;
            values.push(offset);
        }

        // console.log(query); 
        // Execute query
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
      console.error("Error executing findWithConditions:", error);
      throw new Error(`Find with conditions failed: ${error.message}`);
    }
  },



  findById: async (tableName, idColumn, idValue) => {
    try {
      const query = `SELECT * FROM "${tableName}" WHERE "${idColumn}" = $1`;
      const result = await pool.query(query, [idValue]);
      return result.rows[0];
    } catch (error) {
      console.error("Error executing findById:", error);
      throw new Error(`Find by ID operation failed: ${error.message}`);
    }
  },

  findByPhone: async (tableName, phoneColumn, phoneValue) => {
    try {
      const query = `SELECT * FROM "${tableName}" WHERE "${phoneColumn}" = $1`;
      const result = await pool.query(query, [phoneValue]);
      return result.rows[0];
    } catch (error) {
      console.error("Error executing findByPhone:", error);
      throw new Error(`Find by phone operation failed: ${error.message}`);
    }
  },

  findByField: async (tableName, columnName, value) => {
    try {
      const query = `SELECT * FROM "${tableName}" WHERE "${columnName}" = $1`;
      const result = await pool.query(query, [value]);
      return result.rows[0];
    } catch (error) {
      console.error("Error executing findByPhone:", error);
      throw new Error(`Find by phone operation failed: ${error.message}`);
    }
  },

  findAllByField: async (tableName, columnName, value) => {
    try {
      const query = `SELECT * FROM "${tableName}" WHERE "${columnName}" = $1`;
      const result = await pool.query(query, [value]);
      return result.rows;
    } catch (error) {
      console.error("Error executing findByPhone:", error);
      throw new Error(`Find by phone operation failed: ${error.message}`);
    }
  },

  create: async (tableName, columns, values) => {
    try {
      const keyArr = keyUtils.getKeysAsArray(columns);
      const setColumns = keyArr.join(", ");
      const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
      const query = `INSERT INTO "${tableName}" (${setColumns}) VALUES (${placeholders}) RETURNING *`;
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error executing create:", error);
      throw new Error(`Create operation failed: ${error.message}`);
    }
  },

  update: async (tableName, idColumn, idValue, columns, values) => {
    try {
      // Check if columns are populated
      // if (columns.length === 0) {
      //   throw new Error("No columns provided for the update operation.");
      // }

      const setClause = columns
        .map((col, i) => `"${col}" = $${i + 1}`) // safely create SET clause
        .join(", ");

      const query = `UPDATE "${tableName}" SET ${setClause} WHERE "${idColumn}" = $${columns.length + 1} RETURNING *`;

      // // Log the query and values for debugging
      // console.log("Generated query:", query);
      // console.log("Values:", [...values, idValue]);

      const result = await pool.query(query, [...values, idValue]);

      return result.rows[0];
    } catch (error) {
      console.error("Error executing update:", error);
      throw new Error(`Update operation failed: ${error.message}`);
    }
  },



  deleteById: async (tableName, idColumn, idValue) => {
    try {
      const query = `DELETE FROM "${tableName}" WHERE "${idColumn}" = $1`;
      await pool.query(query, [idValue]);
      return true;
    } catch (error) {
      console.error("Error executing delete:", error);
      throw new Error(`Delete operation failed: ${error.message}`);
    }
  },

  deleteWithConditionsJoin: async (
    tableName,
    conditions = [], 
    logicalOperators = ["AND"], 
    joins = [] 
  ) => {
    try {
      if (conditions.length === 0) return false; // No conditions means no delete
  
      let query = `DELETE FROM "${tableName}"`;
      const values = [];
      let flag = 0;
      const whereClauses = [];
  
      // Handling JOIN clauses if any
      if (joins.length > 0) {
        joins.forEach((join) => {
          const { table, on, type = "INNER" } = join; // Default to INNER JOIN
          query += ` ${type} JOIN "${table}" ON ${on}`;
        });
      }
  
      // Handling WHERE conditions
      if (conditions.length > 0) {
        conditions.forEach((condition, index) => {
          const { column, value, operator = "=" } = condition;
  
          if (value !== undefined && value !== null) {
            if (operator === "BETWEEN" && Array.isArray(value) && value.length === 2) {
              // Handle BETWEEN condition
              whereClauses.push(`"${column}" BETWEEN $${flag + 1} AND $${flag + 2}`);
              values.push(value[0], value[1]); // Push both values for the BETWEEN clause
              flag += 2;
            } else {
              whereClauses.push(`"${column}" ${operator} $${flag + 1}`);
              values.push(value);
              flag++;
            }
  
            // Add logical operator if it's not the last condition
            if (index < conditions.length - 1) {
              whereClauses.push(` ${logicalOperators[index] || "AND"} `);
            }
          }
        });
  
        if (whereClauses.length > 0) {
          query += ` WHERE ${whereClauses.join("")}`;
        }
      }
  
      console.log(query); 
      // Execute delete query
      const result = await pool.query(query, values);
      return result.rowCount; // Return the number of deleted rows
    } catch (error) {
      console.error("Error executing deleteWithConditionsJoin:", error);
      throw new Error(`Delete operation failed: ${error.message}`);
    }
  },
  

  findAllWithPhone: async (roleTable) => {
    try {
      const query = `
          SELECT 
            r.*,
            u."phoneNumber" 
          FROM 
            "${roleTable}" r
          JOIN 
            "Users" u 
          ON 
            r."userID" = u."userID";
        `;
      const result = await pool.query(query);

      return result.rows;
    } catch (err) {
      console.error("Error executing delete:", error);
      throw new Error(`Delete operation failed: ${error.message}`);
    }
  },

  executeTransaction: async (transactionCallback) => {
    try {
      await pool.query('BEGIN'); // Start transaction
      const result = await transactionCallback(); // Execute the callback
      await pool.query('COMMIT'); // Commit transaction if successful
      return result;
    } catch (error) {
      await pool.query('ROLLBACK'); // Rollback if there's an error
      throw error;
    } finally {
      (await pool.connect()).release();
    }
  },

  updateWithConditions: async (
    tableName,
    columns,
    values,
    conditions = [],
    logicalOperators = ["AND"]
  ) => {
    try {
      // Check if columns are populated
      if (columns.length === 0) {
        throw new Error("No columns provided for the update operation.");
      }

      // Construct the SET clause
      const setClause = columns
        .map((col, i) => `"${col}" = $${i + 1}`) // safely create SET clause
        .join(", ");

      // Prepare the initial update query
      let query = `UPDATE "${tableName}" SET ${setClause}`;
      const whereClauses = [];
      const conditionValues = [];

      // Add conditions for WHERE clause if provided
      if (conditions.length > 0) {
        let flag = columns.length; // Flag starts after the update values
        conditions.forEach((condition, index) => {
          const { column, value, operator = "=" } = condition;

          if (value !== undefined && value !== null) {
            if (operator === "BETWEEN" && Array.isArray(value) && value.length === 2) {
              // Handle BETWEEN condition
              whereClauses.push(`"${column}" BETWEEN $${flag + 1} AND $${flag + 2}`);
              conditionValues.push(value[0], value[1]);
              flag += 2;
            } else {
              whereClauses.push(`"${column}" ${operator} $${flag + 1}`);
              conditionValues.push(value);
              flag++;
            }

            // Add logical operator if it's not the last condition
            if (index < conditions.length - 1) {
              whereClauses.push(` ${logicalOperators[index] || "AND"} `);
            }
          }
        });

        if (whereClauses.length > 0) {
          query += ` WHERE ${whereClauses.join("")}`;
        }
      }

      // Append RETURNING * to get the updated row(s)
      query += ` RETURNING *`;
      console.log(query)
      // Combine the update values with the condition values
      const finalValues = [...values, ...conditionValues];

      // Execute query
      const result = await pool.query(query, finalValues);

      return result.rows;
    } catch (error) {
      console.error("Error executing update:", error);
      throw new Error(`Update operation failed: ${error.message}`);
    }
  }


};

module.exports = baseModel;