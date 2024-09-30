const validateInput = (body) => {
    if (!body.Email || !body.Password || !body.PhoneNumber) {
        return "Missing required fields: Email, Password, or PhoneNumber";
    }
    return null;
};

const validateInputField = (field) => {
    if(!field) {
        return `Missing required field: ${field}`;
    }
}

module.exports = { validateInput };
