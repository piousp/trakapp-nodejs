import "mongoose-geojson-schema";
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
  ubicacion: {
    coordenadas: {
      type: mongoose.Schema.Types.Point,
      index: "2d",
    },
    lastUpdate: Date,
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cliente",
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

const modelo = mongoose.model("empleado", esquema);

export { esquema };
export default modelo;
