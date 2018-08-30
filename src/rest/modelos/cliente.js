import "mongoose-geojson-schema";
import mongoose from "mongoose";

const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellidos: {
    type: String,
    default: "",
  },
  cedula: String,
  direccion: String,
  ubicacion: {
    type: mongoose.Schema.Types.Point,
    index: "2dsphere",
  },
  cuenta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cuenta",
    required: true,
  },
  correo: String,
  esEmpresa: Boolean,
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
