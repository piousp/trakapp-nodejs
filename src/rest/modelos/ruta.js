import "mongoose-geojson-schema";
import mongoose from "mongoose";

const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  descripcion: String,
  ubicaciones: [{
    pos: {
      type: mongoose.Schema.Types.Point,
      index: "2dsphere",
    },
    nombre: String,
    direccion: String,
    telefono: String,
  }],
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

const modelo = mongoose.model("ruta", esquema);

export { esquema };
export default modelo;
