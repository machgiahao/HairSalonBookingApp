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



// createCustomer
const createCustomer = async (user, body) => {
    const newCustomer = {
        avatar: body.avataURL,
        fullName: body.fullName,
        yob: body.yob,
        email: body.email,
        gender: body.gender,
        loyaltyPoints: body.loyaltyPoints,
        userID: user.userID,
    };
    return await baseModel.create("Customer", Object.keys(newCustomer), Object.values(newCustomer));
};

// createManager
const createManager = async (user, body) => {
    const newManager = {
        avatar: body.avataURL,
        fullName: body.fullName,
        yob: body.yob,
        email: body.email,
        gender: body.gender,
        address: body.address,
        userID: user.userID,
    };
    return await baseModel.create("Manager", Object.keys(newManager), Object.values(newManager));
};

// createStylist
const createStylist = async (user, body) => {

    const newStylist = {
        avatar: body.avataURL,
        fullName: body.fullName,
        yob: body.yob,
        email: body.email,
        gender: body.gender,
        address: body.address,
        level: body.level,
        certificateURL: body.certificateURL,
        salaryID: body.salaryID,
        userID: user.userID
    };
    return await baseModel.create("Stylist", Object.keys(newStylist), Object.values(newStylist));
};

// createStaff
const createStaff = async (user, body) => {
    const newStaff = {
        avatar: body.avataURL,
        fullName: body.fullName,
        yob: body.yob,
        email: body.email,
        gender: body.gender,
        address: body.address,
        salaryID: body.salaryID,
        userID: user.userID
    };
    return await baseModel.create("Staff", Object.keys(newStaff), Object.values(newStaff));
};

module.exports = roleService;
