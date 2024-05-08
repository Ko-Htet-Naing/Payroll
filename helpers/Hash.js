const bcrypt = require("bcrypt");
const saltRound = 3;

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRound, function (err, hash) {
      if (err) reject(err);
      return resolve(hash);
    });
  });
};
const comparePassword = (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  hashPassword,
  comparePassword,
};
