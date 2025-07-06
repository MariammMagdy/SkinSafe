const jwt = require("jsonwebtoken");

console.log("JWT_SECRET at token creation:", process.env.JWT_SECRET);


const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

module.exports = createToken;
