import "mongoose-geojson-schema";
import mongoose from "mongoose";

const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellidos: String,
  cedula: {
    type: String,
    unique: true,
    required: true,
  },
  direccion: {
    type: String,
    required: true,
  },
  ubicacion: {
    type: mongoose.Schema.Types.Point,
    index: "2dsphere",
  },
  cuenta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cuenta",
    required: true,
  },
  borrado: {
    type: Boolean,
    default: false,
    select: false,
    index: true,
  },
});

const modelo = mongoose.model("cliente", esquema);

export { esquema };
export default modelo;
