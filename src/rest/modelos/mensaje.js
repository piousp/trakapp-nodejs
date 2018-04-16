import mongoose from "mongoose";

const esquema = new mongoose.Schema({
  texto: {
    type: String,
    required: true,
  },
  fechaEnvio: {
    type: Date,
    default: Date.now,
  },
  emisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "empleado",
    required: true,
  },
  receptor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "empleado",
    required: true,
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

const modelo = mongoose.model("mensaje", esquema);

export { esquema };
export default modelo;
