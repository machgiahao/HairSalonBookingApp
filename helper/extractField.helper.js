module.exports = (table, body) => {
    const columns = [];
    const values = [];
    
    for (const key in body) {
        if (table.columns[key] !== undefined) {
            columns.push(table.columns[key]);
            values.push(body[key]);
        }
    }
    
    return { columns, values };
};