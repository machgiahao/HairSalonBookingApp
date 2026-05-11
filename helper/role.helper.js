const baseModel = require("../model/base.model");
const customerTable = require("../model/table/customer.table");
const managerTable = require("../model/table/manager.table");
const stylistTable = require("../model/table/stylist.table");
const staffTable = require("../model/table/staff.table");
const { getColsVals } = require("../helper/getColsVals.helper");

const roleService = {
    // Handle user roles
    handleRole: async (user, body) => {
        const roleHandlers = {
            Customer: createCustomer,
            Manager: createManager,
            Stylist: createStylist,
            Staff: createStaff,
        };

        const handler = roleHandlers[user.role];
        if (handler) {
            return await handler(user, body);
        }
        return null;
    },

    getTableByRole: (user) => {
        const roleHandlers = {
            Customer: "Customer",
            Manager: "Manager",
            Stylist: "Stylist",
            Staff: "Staff",
        };

        const handler = roleHandlers[user.role];
        if (handler) {
            return handler;
        }
        return null;
    },
};

// Create customer
const createCustomer = async (user, body) => {
    body.userID = user.userID;
    const { columns, values } = getColsVals(customerTable, body);
    return await baseModel.create(customerTable.name, columns, values);
};

// Create manager
const createManager = async (user, body) => {
    body.userID = user.userID;
    const { columns, values } = getColsVals(managerTable, body);
    return await baseModel.create(managerTable.name, columns, values);
};

// Create stylist
const createStylist = async (user, body) => {
    body.userID = user.userID;
    const { columns, values } = getColsVals(stylistTable, body);
    return await baseModel.create(stylistTable.name, columns, values);
};

// Create staff
const createStaff = async (user, body) => {
    body.userID = user.userID;
    const { columns, values } = getColsVals(staffTable, body);
    return await baseModel.create(staffTable.name, columns, values);
};

module.exports = roleService;
