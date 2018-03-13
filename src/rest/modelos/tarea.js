import mongoose from "mongoose";

const esquema = new mongoose.Schema({
  title: {
    type: String, required: true,
  },
  start: {
    type: Date, required: true,
  },
  end: {
    type: Date, required: true,
  },
  empleado: {
    type: mongoose.Schema.Types.ObjectId, ref: "empleado",
  },
  descripcion: String,
  borrado: {
    type: Boolean, default: false, select: false, index: true,
  },
});

const tarea = mongoose.model("tarea", esquema);

export { esquema, tarea };
