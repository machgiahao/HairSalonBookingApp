// module.exports = (mainTable, joinTable = []) => {
//     const columns =[];
//     for(var key in mainTable.columns){
//         columns.push(`"${mainTable.name}"."${mainTable.columns[key]}"`);

//     }
//     if(joinTable.length<=0) return columns;

//     joinTable.forEach((table)=>{
//         for (const key in table.columns) {
//             columns.push(`"${table.name}"."${table.columns[key]}"`);
//         }
//     })
//     return columns;
// }

const refactor = {
    columnsRefactor: (mainTable, joinTable = [],ignoreColumns=[]) => {
        const columns = [];
        for (var key in mainTable.columns) {
            if(ignoreColumns.includes(mainTable.columns.key)) continue;
            if(mainTable.columns[key]=== `deleted`){
                columns.push(`"${mainTable.name}"."${mainTable.columns[key]}" as "${mainTable.name+`Deleted`}"`);
            }else{
            columns.push(`"${mainTable.name}"."${mainTable.columns[key]}"`);
            }
        }
        if (joinTable.length <= 0) return columns;

        joinTable.forEach((table) => {
            for (const key in table.columns) {
                if(ignoreColumns.includes(table.columns.key)) continue;
                if(table.columns[key]=== `deleted`){
                    columns.push(`"${table.name}"."${table.columns[key]}" as "${table.name+`Deleted`}"`);
                }else{
                    

                    columns.push(`"${table.name}"."${table.columns[key]}"`);
                }
                
            }
        })
        return columns;
    },

    singleRefactor: (mainTable, columns = []) => {
        const refactoredColumns = [];
        for (const key of columns) {
            refactoredColumns.push(`"${mainTable}"."${key}"`);
        }
        return refactoredColumns;
    }

}

module.exports = refactor