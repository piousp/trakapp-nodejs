import mongoose from "mongoose";
import { presave, comparePassword } from "./encriptador";

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

esquema.pre("save", presave);
esquema.methods.comparePassword = comparePassword;

const modelo = mongoose.model("usuario", esquema);

export { esquema };
export default modelo;
