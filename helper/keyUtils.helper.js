module.exports.getKeysAsArray = (arr) => {
    return arr.map(key => `"${key}"`);
};
