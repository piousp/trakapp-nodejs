import mongoose from "mongoose";

const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellidos: String,
  position: {
    lat: {
      type: Number,
      default: 0.0,
    },
    lng: {
      type: Number,
      default: 0.0,
    },
  },
  borrado: {
    type: Boolean, default: false, select: false, index: true,
  },
});

const empleado = mongoose.model("empleado", esquema);

export { esquema, empleado };
