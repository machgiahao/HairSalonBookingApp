const validateInputField = (field, fieldname) => {
    if(!field) {
        throw new Error(`Missing required field: ${fieldname}`);
    }
    return null;
}

module.exports = { validateInputField };
