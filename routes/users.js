// Create the router object that will manage all operations on users
const usersRouter = require("express").Router();
// Import the user model that we'll need in controller functions
const User = require("../models/user");

usersRouter.get("/", async (req, res, next) => {
  try {
    const [result] = await User.findMany();
    delete result[0].hashedPassword;
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving users from database");
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const {id} = req.params;
    const results = await User.findOne(id);
    delete result[0].hashedPassword;
      if(results && results.length == 0){
        res.status(404).send('Error user not found');
      } else {
        res.status(200).json(results);
      }
    } catch (err) {
      console.log(err)
      res.status(500).send('Error retrieving user from database');
  }
});

usersRouter.post("/", async (req, res, next) => {
  try {
    const { body } = req;
    const email = body.email;
    const [isUserExisting] = await User.findByEmail(email);
    delete isUserExisting.hashedPassword;
    if (isUserExisting) {
      return res.status(409).json({ message: 'This email is already used' });
    };
    const error = User.validate(body);
    const [result] = await User.create(body);
    if (error) {
      console.log(error);
      res.status(422).json({ validationErrors: error.details });
    } else {
      res.status(201).json({
        id: result.insertId,
        ...body
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving the user');
  }
});

usersRouter.put("/:id", async (req, res, next) => {
  try {
    const {id} = req.params;
    const { body } = req;
    let existingUser = null;
    let validationErrors = null;
    const [results] = await User.findOne(id);
    console.log(results);
    existingUser = results;
    if (!existingUser) {
      return res.status(404).send(`User with id ${id} not found.`);
    }
    await User.update(body, id);
    validationErrors = User.validate(req.body, false);
    if (validationErrors) {
      return res.status(422).json({ validationErrors: validationErrors.details });
    } else {
      res.status(201).json(
        { ...existingUser, ...req.body }
      );
      }
  } catch (err) { 
      console.error(err);
      res.status(500).send('Error updating a user.');
    }
});

usersRouter.delete("/:id", async (req, res, next) => {
  try {
    const {id} = req.params;
    const deleted = await User.remove(id);
    if (deleted[0].affectedRows == 1) {
      res.status(200).send('🎉 User deleted!');
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Error deleting a user');
  }
});

module.exports = usersRouter;