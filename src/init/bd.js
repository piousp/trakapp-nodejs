import D from "debug";
import mongoose from "mongoose";
import entorno from "../entorno.js";

const debug = D("ciris:bd.js");
mongoose.connect(entorno.MONGO_URI);

const db = mongoose.connection;
db.on("error", (error) => {
  debug(`Error de conexión:${error}`);
});
db.once("open", () => {
  debug("Conexión establecida");
});

export default db;
