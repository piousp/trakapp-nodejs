import mongoose from "mongoose";

const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    required: true,
  },
  direccion: {
    type: String,
  },
  cedula: {
    type: String,
  },
  empresarial: {
    type: Boolean,
    default: false,
  },
  borrado: {
    type: Boolean,
    default: false,
    select: false,
    index: true,
  },
});

const modelo = mongoose.model("cuenta", esquema);

export { esquema };
export default modelo;
