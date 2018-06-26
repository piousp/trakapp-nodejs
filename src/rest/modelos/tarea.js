import "mongoose-geojson-schema";
import mongoose from "mongoose";

const esquema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  descripcion: String,
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  ubicacion: {
    type: mongoose.Schema.Types.Point,
    index: "2dsphere",
  },
  empleado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "empleado",
  },
  cuenta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cuenta",
    required: true,
  },
  horaInicio: Date,
  horaFin: Date,
  borrado: {
    type: Boolean,
    default: false,
    select: false,
    index: true,
  },
  activa: {
    type: Boolean,
    default: true,
    index: true,
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cliente",
    required: true,
  },
});

const modelo = mongoose.model("tarea", esquema);

export { esquema };
export default modelo;
