import bcrypt from "bcrypt";
import util from "util";
import D from "debug";

const debug = D("ciris:modelos/encriptador.js");

const SALT_WORK_FACTOR = 10;

async function comparePassword(inputPassword) {
  try {
    const passwd = this.password;
    debug("Comparando los passwords", inputPassword, passwd);
    const isMatch = await util.promisify(bcrypt.compare)(inputPassword, passwd);
    debug("resultado comparación passwds", isMatch);
    return isMatch;
  } catch (err) {
    debug(err);
    return false;
  }
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
