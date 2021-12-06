// Create the router object that will manage all operations on movies
const moviesRouter = require("express").Router();
// Import the movie model that we'll need in controller functions
const Movie = require("../models/movie");

moviesRouter.get("/", async (req, res, next) => {
  try {
    const [result] = await Movie.findMany();
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving movies from database");
  }
});

moviesRouter.get("/:id", async (req, res, next) => {
  try {
    const {id} = req.params;
    const results = await Movie.findOne(id)
      if(results && results.length == 0){
        res.status(404).send('Error movie not found');
      } else {
        res.status(200).json(results);
      }
    } catch (err) {
      console.log(err)
      res.status(500).send('Error retrieving movie from database');
  }
});

moviesRouter.post("/", async (req, res, next) => {
  try {
    const { body } = req;
    const error = Movie.validate(body);
    const [result] = await Movie.create(body);
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
    res.status(500).send('Error saving the movie');
  }
})

moviesRouter.put("/:id", async (req, res, next) => {
  try {
    const {id} = req.params;
    const { body } = req;
    let existingMovie = null;
    let validationErrors = null;
    const [results] = await Movie.findOne(id);
    console.log(results);
    existingMovie = results;
    if (!existingMovie) {
      return res.status(404).send(`Movie with id ${id} not found.`);
    }
    await Movie.update(body, id);
    validationErrors = Movie.validate(req.body, false);
    if (validationErrors) {
      return res.status(422).json({ validationErrors: validationErrors.details });
    } else {
      res.status(201).json(
        { ...existingMovie, ...req.body }
      );
      }
  } catch (err) { 
      console.error(err);
      res.status(500).send('Error updating a movie.');
    }
});

moviesRouter.delete("/:id", async (req, res, next) => {
  try {
    const {id} = req.params;
    const deleted = await Movie.remove(id);
    if (deleted[0].affectedRows == 1) {
      res.status(200).send('🎉 Movie deleted!');
    } else {
      res.status(404).send('Movie not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Error deleting a movie');
  }

});

module.exports = moviesRouter;
