const baseModel = require("../model/base.model");

const roleService = {
    // Handle user roles
    handleRole: async (user, body) => {
        const roleHandlers = {
            Customer: createCustomer,
            Manager: createManager,
            Stylist: createStylist,
            Staff: createStaff,
        };

        const handler = roleHandlers[user.Role];
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



// createCustomer
const createCustomer = async (user, body) => {
    const count = await baseModel.countDocuments("Customer");
    const id = 'c' + (count + 1);
    const newCustomer = {
        CustomerID: id,
        FullName: body.FullName,
        UserID: user.UserID
    };
    return await baseModel.create("Customer", Object.keys(newCustomer), Object.values(newCustomer));
};

// createManager
const createManager = async (user, body) => {
    const count = await baseModel.countDocuments("Manager");
    const id = 'm' + (count + 1);
    const newManager = {
        ManagerID: id,
        FullName: body.FullName,
        UserID: user.UserID
    };
    return await baseModel.create("Manager", Object.keys(newManager), Object.values(newManager));
};

// createStylist
const createStylist = async (user, body) => {
    const count = await baseModel.countDocuments("Stylist");
    const id = 'sl' + (count + 1);
    const newStylist = {
        StylistID: id,
        FullName: body.FullName,
        Level: body.Level,
        UserID: user.UserID
    };
    return await baseModel.create("Stylist", Object.keys(newStylist), Object.values(newStylist));
};

// createStaff
const createStaff = async (user, body) => {
    const count = await baseModel.countDocuments("Staff");
    const id = 'st' + (count + 1);
    const newStaff = {
        ManagerID: id,
        FullName: body.FullName,
        UserID: user.UserID
    };
    return await baseModel.create("Staff", Object.keys(newStaff), Object.values(newStaff));
};

module.exports = roleService;
