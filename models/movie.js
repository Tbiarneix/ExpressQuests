const connection = require("../db-config");
const Joi = require("joi");

const validate = (data, forCreation = true) => {
  const presence = forCreation ? 'required' : 'optional';
  return Joi.object({
    title: Joi.string().max(255).presence(presence),
    director: Joi.string().max(255).presence(presence),
    year: Joi.number().integer().min(1888).presence(presence),
    color: Joi.boolean().presence(presence),
    duration: Joi.number().integer().min(1).presence(presence),
  }).validate(data, { abortEarly: false }).error;
};

const findMany = () => {
  return connection.promise().query("SELECT * FROM movies");
};

const findOne = (id) => {
  return connection.promise().query('SELECT * FROM movies WHERE id = ?', [id])
  .then(([result]) => {
    return result;
  }); 
}

const create = (movies) => {
  return connection.promise().query('INSERT INTO movies SET ?', [movies]);
}

const update = (newAttribute, id) => {
  return connection.promise().query('UPDATE movies SET ? WHERE id = ?', [newAttribute, id])
  .then(([result]) => {
    return result;
  }); 
}

const remove = (id) => {
  return connection.promise().query("DELETE FROM movies WHERE id = ?", [id])
}

module.exports = { findMany, findOne, create, update, remove, validate };
