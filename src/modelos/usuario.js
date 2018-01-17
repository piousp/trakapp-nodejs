import mongoose from "mongoose";
import bcrypt from "bcrypt";

const SALT_WORK_FACTOR = 10;
const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  borrado: {
    type: Boolean,
    default: false,
    select: false,
    index: true,
  },
});

function encriptar(usuario, next) {
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) {
      return next(err);
    }
    return bcrypt.hash(usuario.password, salt, (err2, hash) => {
      if (err2) {
        return next(err2);
      }
      usuario.password = hash;
      return next();
    });
  });
}

esquema.pre("save", (next) => {
  const usuario = this;
  if (!usuario.isModified("password")) {
    return next();
  }
  return encriptar(usuario, next);
});

esquema.methods.comparePassword = function comparePassword(inputPassword, callback) {
  bcrypt.compare(inputPassword, this.password, (err, isMatch) => {
    if (err) {
      return callback(err);
    }
    return callback(null, isMatch);
  });
};

const modelo = mongoose.model("usuario", esquema);

export { esquema, modelo };
