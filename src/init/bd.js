import D from "debug";
import mongoose from "mongoose";
import entorno from "../entorno.js";
import revisarPorRoot from "./usuarioRoot.js";

const debug = D("ciris:init/bd.js");
export default initDB;

function initDB() {
  debug(`Inicializando la conexión con la base de datos a ${entorno.MONGO_URI}`);
  mongoose.connect(entorno.MONGO_URI);
  mongoose.set("debug", !entorno.PRODUCCION);

  const db = mongoose.connection;
  db.on("error", (error) => {
    debug(`Error de conexión:${error}`);
  });
  db.once("open", () => {
    debug("Conexión establecida");
    revisarPorRoot();
  });
  return db;
}
