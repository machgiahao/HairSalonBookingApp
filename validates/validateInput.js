const handleError = require("../helper/handleError.helper");

const validateInputField = (field, fieldname) => {
    if (!field) {
        return handleError(res, 400, new Error(`Missing required field: ${fieldname}`));
    }
    return null;
}

const validatePhone = (phone) => {
    const phoneRegex = /^(?:\+84|0)([3|5|7|8|9])([0-9]{8})$/;
    const check = phoneRegex.test(phone);
    if (!check) {
        return false;
    }
    return true;
}

const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const check = emailRegex.test(email);
    if (!check) {
        return false;
    }
    return true;
}

module.exports = { validateInputField, validatePhone, validateEmail };
