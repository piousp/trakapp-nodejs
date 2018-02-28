import D from "debug";
import mongoose from "mongoose";
import entorno from "../entorno.js";

const debug = D("ciris:init/bd.js");
export default initDB;

function initDB() {
  debug(`Inicializando la conexión con la base de datos a ${entorno.MONGO_URI}`);
  mongoose.connect(entorno.MONGO_URI);

  const db = mongoose.connection;
  db.on("error", (error) => {
    debug(`Error de conexión:${error}`);
  });
  db.once("open", () => {
    debug("Conexión establecida");
  });
  return db;
}
