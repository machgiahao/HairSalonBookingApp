const dateRefactor = {
    convert: (date) =>{
        const dateToUse = date ? new Date(date) : new Date();
        const converted = date.toISOString().split('T')[0] + " 00:00:00";
        return converted;
    },
    rangeDate: (date)=>{
        const dateToUse = date ? new Date(date) : new Date();
        const firstDay = new Date(dateToUse.getFullYear(),dateToUse.getMonth(),1);
        const lastDay = new Date(dateToUse.getFullYear(),dateToUse.getMonth(),0);

        return {
            firstDay:firstDay.toISOString().split('T')[0] + " 00:00:00",
            lastDay:lastDay.toISOString().split('T')[0] + " 00:00:00",
        }

    }
}