const authRouter = require("express").Router();
const User = require("../models/user");
const { calculateToken, decodedToken } = require("../helpers/users");

authRouter.post("/login", async (req, res, next) => {
  try {
    const { body } = req;
    const email = body.email;
    const id = body.id;
    const password = body.password;
    const user = await User.findByEmail(email);
    if (!user) {
      res.status(401).send("Invalid credentials");
    } else {
      const passwordIsCorrect = await User.verifyPassword(
        password,
        user[0].hashedPassword
      );
      if (passwordIsCorrect) {
        const token = calculateToken(email, id);
        console.log(decodedToken(token));
        res.cookie("user_token", token);
        res.send();
      } else {
        res.status(401).send("Invalid credentials");
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error Invalid credentials");
  }
});

module.exports = authRouter;