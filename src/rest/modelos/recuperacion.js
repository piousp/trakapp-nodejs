const mongoose = require("mongoose");

const esquema = new mongoose.Schema({
  idUsuario: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  horaCreacion: Date,
  activo: {
    type: Boolean,
    default: true,
    index: true,
  },
  borrado: {
    type: Boolean,
    default: false,
    select: false,
    index: true,
  },
  movil: {
    type: Boolean,
    default: false,
    index: true,
  },
});

const modelo = mongoose.model("recuperacion", esquema);

export { esquema };
export default modelo;
