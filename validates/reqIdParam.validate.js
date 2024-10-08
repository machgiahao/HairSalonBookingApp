
const isValidId = (id) => {
    // Check if ID is a non-empty string that starts with letters followed by numbers
    return typeof id === 'string' && /^[A-Za-z]+\d+$/.test(id.trim());
};

module.exports = isValidId;

// Explanation of the Function
// typeof id === 'string':

// This checks if the input id is of type string.
// id.trim():

// This removes any whitespace from the beginning and end of the string, ensuring that leading or trailing spaces do not affect the validation.
// /^[A-Za-z]+\d+$/:

// This is the regular expression pattern being used to validate the ID.
// ^: Asserts the start of the string.
// [A-Za-z]+: Matches one or more letters (either uppercase or lowercase).
// \d+: Matches one or more digits (0-9).
// $: Asserts the end of the string.
// .test(id.trim()):

// This method tests whether the trimmed ID matches the specified regex pattern. It returns true if there is a match, otherwise false.