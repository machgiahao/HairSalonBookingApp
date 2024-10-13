const baseModel = require("../model/base.model");
const customerTable = require("../model/table/customer.table");
const managerTable = require("../model/table/manager.table");
const stylistTable = require("../model/table/stylist.table");
const staffTable = require("../model/table/staff.table");

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
    const columns = [];
    const values = [];

    for (const key in body) {
        if (customerTable.columns[key] !== undefined && body[key] !== "") {
            columns.push(customerTable.columns[key]);
            values.push(body[key]);
        }
    }
    return await baseModel.create(customerTable.name, columns, values);
};

// Create manager
const createManager = async (user, body) => {
    const columns = [];
    const values = [];

    for (const key in body) {
        if (managerTable.columns[key] !== undefined && body[key] !== "") {
            columns.push(managerTable.columns[key]);
            values.push(body[key]);
        }
    }
    return await baseModel.create(managerTable.name, columns, values);
};

// Create stylist
const createStylist = async (user, body) => {
    const columns = [];
    const values = [];

    for (const key in body) {
        if (stylistTable.columns[key] !== undefined && body[key] !== "") {
            columns.push(stylistTable.columns[key]);
            values.push(body[key]);
        }
    }
    return await baseModel.create(stylistTable.name, columns, values);
};

// Create staff
const createStaff = async (user, body) => {
    const columns = [];
    const values = [];

    for (const key in body) {
        if (staffTable.columns[key] !== undefined && body[key] !== "") {
            columns.push(staffTable.columns[key]);
            values.push(body[key]);
        }
    }
    return await baseModel.create(staffTable.name, columns, values);
};

module.exports = roleService;
