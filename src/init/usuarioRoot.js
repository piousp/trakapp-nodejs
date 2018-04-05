import D from "debug";
import { modelo } from "../rest/modelos/usuario.js";
import funDB from "../rest/comun-db.js";

const debug = D("ciris:init/usuarioRoot.js");
const comun = funDB(modelo);

export default revisarPorRoot;

function revisarPorRoot() {
  debug("Revisando por Root...");
  return comun.findOne(null, { correo: "root" }, null)
    .then(() => debug("Root encontrado!"))
    .catch(() => {
      debug("Root no encontrado, creando...");
      const usuarioRoot = {
        correo: "root",
        password: "cirisCiris.93",
        nombre: "root",
      };
      return comun.create(usuarioRoot);
    })
    .then(() => debug("Root creado!"))
    .catch(err => debug("Alggo pasó", err));
}
