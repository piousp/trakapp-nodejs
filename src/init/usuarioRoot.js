import D from "debug";
import noop from "lodash/noop";
import mongoose from "mongoose";
import modelo from "../rest/modelos/usuario.js";
import funDB from "../rest/comun-db.js";

const debug = D("ciris:init/usuarioRoot.js");
const comun = funDB(modelo);

export default revisarPorRoot;

async function revisarPorRoot() {
  debug("Revisando por Root...");
  try {
    const root = await comun.findOne(null, { correo: "root@ciriscr.com" });
    debug(root);
    if (root) {
      return debug("Root encontrado!");
    }
    debug("Root no encontrado, creando...");
    const usuarioRoot = {
      correo: "root@ciriscr.com",
      password: "rastreadorRootCiris",
      nombre: "root",
      cliente: new mongoose.Types.ObjectId(),
    };
    const nuevoRoot = await comun.create(usuarioRoot);
    if (nuevoRoot._id) {
      return debug("Root creado!");
    }
    return noop;
  } catch (e) {
    debug("Ocurrió un error espantoso al tratar de crear el root", e);
    return noop;
  }
}
