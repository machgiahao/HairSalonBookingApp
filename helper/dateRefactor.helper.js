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
    rangeMonth: (date) => {
        // Ensure 'date' is a valid Date object, or use current date
        const dateToUse = date ? new Date(date) : new Date();
        if (isNaN(dateToUse.getTime())) {
            throw new Error("Invalid date provided.");
        }
        // First day of the month
        const firstDay = new Date(dateToUse.getFullYear(), dateToUse.getMonth(), 1);
        // Last day of the month (corrected to get the last day)
        const lastDay = new Date(dateToUse.getFullYear(), dateToUse.getMonth() + 1, 0);
        date = {
            firstDay: firstDay.toISOString().split('T')[0] + " 00:00:00",
            lastDay: lastDay.toISOString().split('T')[0] + " 00:00:00",
        }
        return date

            ;
    },
    rangeYear: (date) => {
        // Ensure 'date' is a valid Date object, or use current date
        const dateToUse = date ? new Date(date) : new Date();
        if (isNaN(dateToUse.getTime())) {
            throw new Error("Invalid date provided.");
        }

        // First day of the year
        const firstDayOfYear = new Date(dateToUse.getFullYear(), 0, 1);
        // Last day of the year
        const lastDayOfYear = new Date(dateToUse.getFullYear(), 11, 31);
        date = {
            firstDayOfYear: firstDayOfYear.toISOString().split('T')[0] + " 00:00:00", // Corrected key
            lastDayOfYear: lastDayOfYear.toISOString().split('T')[0] + " 00:00:00"   // Corrected key
        }
        return date

            ;
    },
    getFirstDay: (date) => {
        // Ensure 'date' is a valid Date object, or use current date
        const dateToUse = date ? new Date(date) : new Date();
        if (isNaN(dateToUse.getTime())) {
            throw new Error("Invalid date provided.");
        }
        // Return the first day of the month
        const firstDay = new Date(dateToUse.getFullYear(), dateToUse.getMonth(), 1);
        return firstDay.toISOString().split('T')[0] + " 00:00:00";
    },
    getLastDay: (date) => {
        // Ensure 'date' is a valid Date object, or use current date
        const dateToUse = date ? new Date(date) : new Date();
        if (isNaN(dateToUse.getTime())) {
            throw new Error("Invalid date provided.");
        }
        // Return the last day of the month
        const lastDay = new Date(dateToUse.getFullYear(), dateToUse.getMonth() + 1, 0);
        return lastDay.toISOString().split('T')[0] + " 00:00:00";
    },

    getWeekdayAndDate: () => {
        // Get current time
        let date = new Date();
        // Array containing the names of the days
        let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        // Get weekday 
        let weekday = weekdays[date.getDay()];
        // Return object contains weekday and date object
        return {
            weekday: weekday,
            date: date  // Trả về cả đối tượng Date để dễ thao tác sau này
        };
    },

    addDaysAndFormat: (dateObj, daysToAdd) => {
        // Add days
        dateObj.setDate(dateObj.getDate() + daysToAdd);

        // Convert Date object to yyyy-mm-dd string
        return dateObj.toISOString().split('T')[0];
    }
};

module.exports = dateRefactor;
