const jwt = require("jsonwebtoken");
const jwt_decode = require('jwt-decode');

const PRIVATE_KEY = "superSecretStringNowoneShouldKnowOrTheCanGenerateTokens";
const codedToken = ""

const calculateToken = (userEmail = "", userId = "") => {
    return jwt.sign({ email: userEmail, id: userId}, PRIVATE_KEY);
};

const decodedToken = (token) => {
    return jwt_decode(token);
}

module.exports = { calculateToken, decodedToken };
