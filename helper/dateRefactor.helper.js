const dateRefactor = {
    convert: (date) => {
        const dateToUse = date ? new Date(date) : new Date();
        if (isNaN(dateToUse.getTime())) {
            throw new Error("Invalid date provided.");
        }
        // Format date to 'YYYY-MM-DD 00:00:00'
        const year = dateToUse.getFullYear();
        const month = String(dateToUse.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const day = String(dateToUse.getDate()).padStart(2, '0');
        return `${year}-${month}-${day} 00:00:00`;
    },

    rangeMonth: (date) => {
        const dateToUse = date ? new Date(date) : new Date();
        if (isNaN(dateToUse.getTime())) {
            throw new Error("Invalid date provided.");
        }
        const firstDay = new Date(dateToUse.getFullYear(), dateToUse.getMonth(), 1);
        const lastDay = new Date(dateToUse.getFullYear(), dateToUse.getMonth() + 1, 0);
        
        return {
            firstDay: dateUtils.formatDate(firstDay),
            lastDay: dateUtils.formatDate(lastDay),
        };
    },

    rangeYear: (date) => {
        const dateToUse = date ? new Date(date) : new Date();
        if (isNaN(dateToUse.getTime())) {
            throw new Error("Invalid date provided.");
        }
        const firstDayOfYear = new Date(dateToUse.getFullYear(), 0, 1);
        const lastDayOfYear = new Date(dateToUse.getFullYear(), 11, 31);
        
        return {
            firstDayOfYear: dateUtils.formatDate(firstDayOfYear),
            lastDayOfYear: dateUtils.formatDate(lastDayOfYear),
        };
    },

    getFirstDay: (date) => {
        const dateToUse = date ? new Date(date) : new Date();
        if (isNaN(dateToUse.getTime())) {
            throw new Error("Invalid date provided.");
        }
        const firstDay = new Date(dateToUse.getFullYear(), dateToUse.getMonth(), 1);
        return dateUtils.formatDate(firstDay);
    },

    getLastDay: (date) => {
        const dateToUse = date ? new Date(date) : new Date();
        if (isNaN(dateToUse.getTime())) {
            throw new Error("Invalid date provided.");
        }
        const lastDay = new Date(dateToUse.getFullYear(), dateToUse.getMonth() + 1, 0);
        return dateUtils.formatDate(lastDay);
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
