const baseModel = require("../model/base.model");
const handleResponse = require("../helper/handleReponse.helper");
 

module.exports = async (tables = [], idColumns = [], body) => {
    const results = {}; // Initialize results object

    // Validate that tables and idColumns are the same length
    if (tables.length !== idColumns.length) {
        throw new Error("The number of tables must match the number of ID columns.");
    }

    for (let index = 0; index < tables.length; index++) {
        const table = tables[index];
        const idColumn = idColumns[index];
        let idValue;
        const updatedData = {}; // Object to hold updated values

        // Loop through the keys in `body`
        for (const key in body) {
            // Check if the key matches the ID column
            if (key === idColumn) {
                idValue = body[key]; // Store the ID value
            } else if (table.columns[key] !== undefined) {
                // Store the key-value pairs for columns that exist in the current table
                updatedData[table.columns[key]] = body[key]; // Key in the format of table's columns
                results[table.columns[key]] = body[key]
            }
        }

        // Ensure the ID value is set before attempting to update
        if (!idValue) {
            throw new Error(`ID value for table ${table.name} is required and was not provided.`);
        }

        try {
            // Update the base model with the gathered data
            const result = await baseModel.update(table.name, idColumn, idValue, Object.keys(updatedData), Object.values(updatedData));
            console.log(result);
        } catch (error) {
            console.error(`Error updating ${table.name}:`, error);
            return handleResponse(res, 500, { error: error.message });
        }
    }

    return results; // Return the results object
};
