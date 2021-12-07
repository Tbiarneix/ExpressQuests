const connection = require("../db-config");
const argon2 = require("argon2");
const Joi = require("joi");
const { calculateToken } = require("../helpers/users");

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (plainPassword) => {
  return argon2.hash(plainPassword, hashingOptions);
};

const verifyPassword = (plainPassword, hashedPassword) => {
  return argon2.verify(hashedPassword, plainPassword, hashingOptions);
};

const validate = (data, forCreation = true) => {
  const presence = forCreation ? "required" : "optional";
  return Joi.object({
    email: Joi.string().max(255).presence(presence),
    password: Joi.string().min(8).max(255).presence(presence),
    firstname: Joi.string().max(255).presence(presence),
    lastname: Joi.string().max(255).presence(presence),
    city: Joi.string().allow(null, "").max(255),
    language: Joi.string().allow(null, "").max(255),
    // token: Joi.string().allow(null, "").max(255),
  }).validate(data, { abortEarly: false }).error;
};

const findMany = () => {
  return connection.promise().query("SELECT * FROM users")
};

const findOne = (id) => {
  return connection.promise()
    .query("SELECT * FROM users WHERE id = ?", [id])
    .then(([result]) => {
      return result;
    });
};

const findByEmail = (email) => {
  return connection.promise()
    .query('SELECT * FROM users WHERE email = ?', [email])
    .then(([results]) => {
      return results;
    });
};

const findByEmailWithDifferentId = (email, id) => {
  return connection.promise()
    .query('SELECT * FROM users WHERE email = ? AND id <> ?', [email, id])
    .then(([results]) => {
      results[0]
    });
};

const findByToken = (token) => {
  return connection.promise()
    .query('SELECT * FROM users WHERE token = ?', [token])
    .then(([results]) => {
      return results[0];
      // console.log(results);
    });
};

const findMoviesByUser = (user_id) => {
  return connection.promise()
    .query('SELECT * FROM movies WHERE user_id = ?', [user_id])
    .then(([results]) => results);
};

const create = (user) => {
  return hashPassword(user.password)
    .then((hashPassword) => {
      delete user.password;
      user.hashedPassword = hashPassword;
      return user;
    })
    .then((user) => {
      user.token = calculateToken(user.email);
      return user;
    })
    .then((user) => {
      return connection.promise().query("INSERT INTO users SET ?", [user]);
    })
};

const update = (newAttribute, id) => {
  return connection
    .promise()
    .query("UPDATE users SET ? WHERE id = ?", [newAttribute, id])
    .then(([result]) => {
      return result;
    })
    .catch(err => {
      console.log(err);
    })
};

const remove = (id) => {
  return connection.promise().query("DELETE FROM users WHERE id = ?", [id]);
};

module.exports = { hashPassword, verifyPassword, validate, findMany, findOne, findByEmail, findByEmailWithDifferentId, findByToken, findMoviesByUser, create, update, remove };
