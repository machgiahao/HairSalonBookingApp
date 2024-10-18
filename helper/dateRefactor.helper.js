const dateRefactor = {
    convert: (date) => {
        // Ensure 'date' is a valid Date object, or use current date
        const dateToUse = date ? new Date(date) : new Date();
        if (isNaN(dateToUse.getTime())) {
            throw new Error("Invalid date provided.");
        }
        // Return the converted date in the desired format
        const converted = dateToUse.toISOString().split('T')[0] + " 00:00:00";
        return converted;
    },
    rangeDate: (date) => {
        // Ensure 'date' is a valid Date object, or use current date
        const dateToUse = date ? new Date(date) : new Date();
        if (isNaN(dateToUse.getTime())) {
            throw new Error("Invalid date provided.");
        }
        // First day of the month
        const firstDay = new Date(dateToUse.getFullYear(), dateToUse.getMonth(), 1);
        // Last day of the month (corrected to get the last day)
        const lastDay = new Date(dateToUse.getFullYear(), dateToUse.getMonth() + 1, 0);

        return {
            date: {
                firstDay: firstDay.toISOString().split('T')[0] + " 00:00:00",
                lastDay: lastDay.toISOString().split('T')[0] + " 00:00:00",
            }
        };
    }
};

module.exports = dateRefactor;
