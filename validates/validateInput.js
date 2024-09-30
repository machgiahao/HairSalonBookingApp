const validateInput = (body) => {
    if (!body.Email || !body.Password || !body.PhoneNumber) {
        return "Missing required fields: Email, Password, or PhoneNumber";
    }
    return null;
};

module.exports = { validateInput };
