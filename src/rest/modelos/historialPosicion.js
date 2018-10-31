import "mongoose-geojson-schema";
import mongoose from "mongoose";

const esquema = new mongoose.Schema({
  ubicaciones: {
    type: mongoose.Schema.Types.LineString,
    index: "2dsphere",
  },
  lastUpdate: Date,
  fecha: {
    type: Date,
    required: true,
    index: true,
  },
  cuenta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cuenta",
    required: true,
    index: true,
  },
  empleado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "empleado",
    required: true,
    index: true,
  },
  borrado: {
    type: Boolean,
    default: false,
    select: false,
    index: true,
  },
});

const modelo = mongoose.model("historialPocision", esquema);

export { esquema };
export default modelo;
