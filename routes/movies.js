// Create the router object that will manage all operations on movies
const moviesRouter = require("express").Router();
// Import the movie model that we'll need in controller functions
const Movie = require("../models/movie");
const User = require("../models/user");

moviesRouter.get("/", async (req, res, next) => {
  try {
    const { user_token } = req.cookies;
    const results = await User.findByToken(user_token);
    console.log(results);
    if (results.id !== 0) {
      const userMovies = await User.findMoviesByUser(results.id);
      if (userMovies && userMovies.length == 0) {
        res.status(404).send("Error movies not found");
      } else {
        res.status(200).json(userMovies);
      }
    } else {
      const { user_token } = req.cookies;
      console.log(user_token);
      User.findByToken(user_token)
        .then((user) => {
          console.log(user);
          User.findMoviesByUser(user.id)
            .then((movies) => {
              res.send(movies);
            })
            .catch(() => res.status(500).send("Error"));
        })
        .catch(() => res.status(401).send("Unauthorized access"));
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving movies from database");
  }
});

moviesRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await Movie.findOne(id);
    if (results && results.length == 0) {
      res.status(404).send("Error movie not found");
    } else {
      res.status(200).json(results);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving movie from database");
  }
});

moviesRouter.post("/", async (req, res, next) => {
  try {
    const existingUser = await User.findByToken(req.cookies["user_token"]);
    const { body } = req;
    const error = Movie.validate(body);
    const [result] = await Movie.create(body);
    if (error) {
      console.log(error);
      res.status(422).json({ validationErrors: error.details });
    } else {
      res.status(201).json({
        id: result.insertId,
        user_id: existingUser.id,
        ...body,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving the movie");
  }
});

moviesRouter.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;
    let existingMovie = null;
    let validationErrors = null;
    const [results] = await Movie.findOne(id);
    existingMovie = results;
    if (!existingMovie) {
      return res.status(404).send(`Movie with id ${id} not found.`);
    }
    await Movie.update(body, id);
    validationErrors = Movie.validate(req.body, false);
    if (validationErrors) {
      return res
        .status(422)
        .json({ validationErrors: validationErrors.details });
    } else {
      res.status(201).json({ ...existingMovie, ...req.body });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating a movie.");
  }
});

moviesRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Movie.remove(id);
    if (deleted[0].affectedRows == 1) {
      res.status(200).send("🎉 Movie deleted!");
    } else {
      res.status(404).send("Movie not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting a movie");
  }
});

module.exports = moviesRouter;
