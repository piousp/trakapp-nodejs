import bcrypt from "bcrypt";

const SALT_WORK_FACTOR = 10;

function comparePassword(inputPassword, callback) {
  bcrypt.compare(inputPassword, this.password, (err, isMatch) => {
    if (err) {
      return callback(err);
    }
    return callback(null, isMatch);
  });
}

function encriptar(modelo, next) {
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) {
      return next(err);
    }
    return bcrypt.hash(modelo.password, salt, (err2, hash) => {
      if (err2) {
        return next(err2);
      }
      modelo.password = hash;
      return next();
    });
  });
}

function presave(next) {
  const modelo = this;
  if (!modelo.isModified("password")) {
    return next();
  }
  return encriptar(modelo, next);
}

export { presave, comparePassword };
