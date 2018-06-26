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
  costoHora: {
    type: Number,
  },
  horaExtra: {
    type: Number,
  },
  horarios: {
    lunes: horario(),
    martes: horario(),
    miercoles: horario(),
    jueves: horario(),
    viernes: horario(),
    sabado: horario(),
    domingo: horario(),
  },
  password: {
    type: String,
    default: "movil123",
  },
  device: {
    token: String,
    platform: String,
  },
  ubicacion: {
    pos: {
      type: mongoose.Schema.Types.Point,
      index: "2dsphere",
    },
    lastUpdate: Date,
  },
  cuenta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cuenta",
    required: true,
  },
  nuevo: {
    type: Boolean,
    default: true,
  },
  borrado: {
    type: Boolean,
    default: false,
    select: false,
    index: true,
  },
});

function horario() {
  return {
    desde: Number,
    hasta: Number,
  };
}

esquema.pre("save", presave);
esquema.methods.comparePassword = comparePassword;

const modelo = mongoose.model("empleado", esquema);

export { esquema };
export default modelo;
