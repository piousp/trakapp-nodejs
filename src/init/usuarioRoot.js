import D from "debug";
import noop from "lodash/noop";
import Admin from "../rest/modelos/admin.js";
import Cuenta from "../rest/modelos/cuenta.js";
import Usuario from "../rest/modelos/usuario.js";
import Empleado from "../rest/modelos/empleado.js";
import funDB from "../rest/comun-db.js";

const debug = D("ciris:init/usuarioRoot.js");
const comun = funDB(Admin);

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
    // admin
    const cuentaAdmin = await Cuenta.create({
      nombre: "admin",
      correo: "admin@ciriscr.com",
    });
    const usuarioAdmin = await Usuario.create({
      correo: "admin@ciriscr.com",
      password: "cirisCiris.93",
      nombre: "admin",
      apellidos: "admin",
      activo: true,
      cuentas: [cuentaAdmin._id],
    });
    if (usuarioAdmin._id) {
      debug("Admin creado!");
    }
    // movil
    const usuarioEmpleado = await Empleado.create({
      nombre: "movil",
      correo: "movil@ciriscr.com",
      password: "cirisCiris.93",
      cuenta: cuentaAdmin._id,
    });
    if (usuarioEmpleado._id) {
      debug("Empleado creado!");
    }
    // dashboard
    const usuarioRoot = {
      correo: "root@ciriscr.com",
      password: "cirisCiris.93",
      nombre: "root",
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
