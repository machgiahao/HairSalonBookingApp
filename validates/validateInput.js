const validateInputField = (field) => {
    if(!field) {
        return `Missing required field: ${field}`;
    }
    return null;
}

module.exports = { validateInputField };
