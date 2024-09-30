  const pool = require("../../../config/database");
  pool.connect();

  const baseModel = {
    find: async (tableName, columns = ["*"], { limit, skip } = {}) => {
      try {
        const setColumns = columns.join(", ");
        let query = `SELECT ${setColumns} FROM ${tableName}`;

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
        const query = `SELECT COUNT(*) FROM ${tableName}`;
        const rows = (await pool.query(query)).rows;
        return rows[0].count;
      } catch (error) {
        console.error("Error executing countDocuments:", error);
        throw new Error(`Count operation failed: ${error.message}`);
      }
    },

    findWithConditions: async (tableName,columns = ["*"],{ conditions = [], logicalOperators = ["AND"] } = {}) => {
      try {
        const setColumns = columns.join(", ");
        let query = `SELECT ${setColumns} FROM ${tableName}`;
        const values = [];
        const whereClauses = [];

        if (conditions.length > 0) {
          conditions.forEach((condition, i) => {
            const { column, value, operator = "=" } = condition;
            if (value != null) {
              let queryClause = `${column} ${operator} $${values.length + 1}`;
              values.push(value);

              if (i < conditions.length - 1) {
                queryClause += ` ${
                  logicalOperators.length > i
                    ? logicalOperators[i]
                    : logicalOperators[0]
                } `;
              }
              whereClauses.push(queryClause);
            }
          });

          if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(" ")}`;
          }
        }

        return (await pool.query(query, values)).rows;
      } catch (error) {
        console.error("Error executing findWithConditions:", error);
        throw new Error(`Find with conditions failed: ${error.message}`);
      }
    },

    findById: async (tableName, idColumn, idValue) => {
      try {
        const query = `SELECT * FROM ${tableName} WHERE ${idColumn} = $1`;
        const rows = await pool.query(query, [idValue]);
        return rows[0];
      } catch (error) {
        console.error("Error executing findById:", error);
        throw new Error(`Find by ID operation failed: ${error.message}`);
      }
    },

    findByPhone: async (tableName, phoneColumn, phoneValue) => {
      try {
        const query = `SELECT * FROM ${tableName} WHERE "${phoneColumn}" = $1`;
        const rows = await pool.query(query, [phoneValue]);
        return rows[0];
      } catch (error) {
        console.error("Error executing findByPhone:", error);
        throw new Error(`Find by phone operation failed: ${error.message}`);
      }
    },

    create: async (tableName, columns, values) => {
      try {
        const setColumns = columns.join(", ");
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        const query = `INSERT INTO ${tableName} (${setColumns}) VALUES (${placeholders}) RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows.length > 0 ? result.rows[0] : null;
      } catch (error) {
        console.error("Error executing create:", error);
        throw new Error(`Create operation failed: ${error.message}`);
      }
    },

    update: async (tableName, idColumn, idValue, columns, values) => {
      try {
        const setClause = columns
          .map((col, i) => `${col} = $${i + 1}`)
          .join(", ");
        const query = `UPDATE ${tableName} SET ${setClause} WHERE ${idColumn} = $${
          columns.length + 1
        } RETURNING *`;
        const rows = await pool.query(query, [...values, idValue]);
        return rows[0];
      } catch (error) {
        console.error("Error executing update:", error);
        throw new Error(`Update operation failed: ${error.message}`);
      }
    },

    deleteWithConditions: async (tableName,{ conditions = [], logicalOperator = " AND " } = {}) => {
      try {
        if (conditions.length === 0) return false;

        let query = `DELETE FROM ${tableName} WHERE `;
        const values = [];
        const whereClauses = [];

        conditions.forEach((element, i) => {
          const { column, value, operator = "=" } = element;
          whereClauses.push(`${column} ${operator} $${i + 1}`);
          values.push(value);
        });

        query += whereClauses.join(logicalOperator);
        const result = await pool.query(query, values);

        return result.rowCount;
      } catch (error) {
        console.error("Error executing delete:", error);
        throw new Error(`Delete operation failed: ${error.message}`);
      }
    },

    deleteById: async (tableName, idColumn, idValue) => {
      try {
        const query = `DELETE FROM ${tableName} WHERE ${idColumn} = $1`;
        await pool.query(query, [idValue]);
        return true;
      } catch (error) {
        console.error("Error executing delete:", error);
        throw new Error(`Delete operation failed: ${error.message}`);
      }
    },


    

  };

  module.exports = baseModel;
