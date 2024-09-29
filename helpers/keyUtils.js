
module.exports.getKeysAsArray = (obj) => {
        return Object.keys(obj).map(key => `"${key}"`);
}