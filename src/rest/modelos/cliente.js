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
    type: Date,
  },
  cedula: {
    type: String,
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
