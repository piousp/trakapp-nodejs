import mongoose from "mongoose";

const esquema = new mongoose.Schema({
  nombre: String,
  apellidos: String,
  position: {
    lat: Number,
    lng: Number,
  },
  borrado: {
    type: Boolean, default: false, select: false, index: true,
  },
});

const empleado = mongoose.model("empleado", esquema);

export { esquema, empleado };
