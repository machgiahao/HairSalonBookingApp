const dateRefactor = {
    convert: (date) =>{
        const dateToUse = date ? new Date(date) : new Date();
        const converted = date.toISOString().split('T')[0] + " 00:00:00";
        return converted;
    },
    rangeDate: (range)=>{
        const dateToUse = date ? new Date(date) : new Date();

    }
}