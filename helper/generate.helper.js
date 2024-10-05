const jwt = require("jsonwebtoken")

module.exports.generateRandomString = (length) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let index = 0; index < length; index++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports.generateRandomNumber = (length) => {
  const characters = "0123456789";
  let result = "";
  for (let index = 0; index < length; index++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports.generateAccessToken = (user) => {
  return jwt.sign({
    userID: user.userID,
    role: user.role
  }, process.env.JWT_ACCESS_KEY, {expiresIn: "1d"});
};

module.exports.generateRefreshToken = (user) => {
  return jwt.sign({
    userID: user.userID,
    role: user.role
  }, process.env.JWT_REFRESH_KEY, {expiresIn: "3d"});
};