import mongoose from "mongoose";

const esquema = new mongoose.Schema({
  texto: {
    type: String,
    required: true,
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
  fechaEnvio: {
    type: Date,
    default: Date.now,
  },
  borrado: {
    type: Boolean, default: false, select: false, index: true,
  },
});

const mensaje = mongoose.model("mensaje", esquema);

export { esquema, mensaje };
