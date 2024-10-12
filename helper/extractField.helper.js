const baseModel = require("../model/base.model");

module.exports = async (tables = [], idColumns = [], req) => {
    const results = {}; // Initialize results object

    // Validate that tables and idColumns are the same length
    if (tables.length !== idColumns.length) {
        throw new Error("The number of tables must match the number of ID columns.");
    }

    for (let index = 0; index < tables.length; index++) {
        const table = tables[index];
        const idColumn = idColumns[index];
        let idValue;
        const columns=[];
        const values = [];

        // Loop through the keys in `body`
        for (const key in req.body) {
            // Check if the key matches the ID column
            if (key === idColumn) {
                idValue = req.body[key]; // Store the ID value
            } else if (table.columns[key] !== undefined) {
                // Store the key-value pairs for columns that exist in the current table
                columns.push(table.columns[key]);
                values.push(req.body[key]);
                results[table.columns[key]] = req.body[key]
            }
        }

        // Ensure the ID value is set before attnpmempting to update
        if (!idValue) {
            throw new Error(`ID value for table ${table.name} is required and was not provided.`);
        }

        try {
            // Update the base model with the gathered data
            const result = await baseModel.update(table.name, idColumn, idValue, columns, values);

            console.log(result);
        } catch (error) {
            console.error(`Error updating ${table.name}:`, error);
            throw error; // Rethrow the error to be handled by the calling function
        }
    }

    return results; // Return the results object
};
