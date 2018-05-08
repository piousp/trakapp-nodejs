import bcrypt from "bcrypt";
import util from "util";
import D from "debug";

const debug = D("ciris:modelos/encriptador.js");

const SALT_WORK_FACTOR = 10;

export { presave, comparePassword, encriptar };

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

async function encriptar(password) {
  debug("Encriptando password");
  const salt = await util.promisify(bcrypt.genSalt)(SALT_WORK_FACTOR);
  const hash = await util.promisify(bcrypt.hash)(password, salt);
  return hash;
}

async function encriptarPasswordModelo(modelo, next) {
  try {
    modelo.password = encriptar(modelo.password);
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
  return encriptarPasswordModelo(modelo, next);
}
