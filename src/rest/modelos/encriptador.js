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

async function encriptar(modelo, next) {
  try {
    const salt = await util.promisify(bcrypt.genSalt)(SALT_WORK_FACTOR);
    const hash = await util.promisify(bcrypt.hash)(modelo.password, salt);
    modelo.password = hash;
    return next();
  } catch (err) {
    return next(err);
  }
}

function presave(next) {
  const modelo = this;
  if (!modelo.isModified("password")) {
    return next();
  }
  return encriptar(modelo, next);
}

export { presave, comparePassword };
