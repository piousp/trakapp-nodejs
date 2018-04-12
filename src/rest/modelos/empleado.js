import mongoose from "mongoose";
import { presave, comparePassword } from "./encriptador";

const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellidos: String,
  correo: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    default: "movil123",
  },
  position: {
    lat: {
      type: Number,
      default: 0.0,
    },
    lng: {
      type: Number,
      default: 0.0,
    },
  },
  borrado: {
    type: Boolean, default: false, select: false, index: true,
  },
});

esquema.pre("save", presave);
esquema.methods.comparePassword = comparePassword;

const modelo = mongoose.model("empleado", esquema);

export { esquema };
export default modelo;
