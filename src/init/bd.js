import D from "debug";
import mongoose from "mongoose";
import config from "./config.js";

const debug = D("ciris:bd.js");
mongoose.connect(config.MONGO_URI);

const db = mongoose.connection;
db.on("error", (error) => {
  debug(`Error de conexión:${error}`);
});
db.once("open", () => {
  debug("Conexión establecida");
});

export default db;
