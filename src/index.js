import D from "debug";
import io from "socket.io";
import servidor from "./init/express.js";
// import { estaAutorizado } from "./rest/login/middleware.js";
import emailPass from "./rest/login/emailPass.js";
import empleados from "./rest/rutas/empleado.js";
import tareas from "./rest/rutas/tarea.js";
import mensajes from "./rest/rutas/mensaje.js";
import usuarios from "./rest/rutas/usuario.js";
import entorno from "./entorno.js";

import { modelo } from "./rest/modelos/usuario.js";
import { Comunes } from "./rest/comun-db.js";

const comun = new Comunes(modelo);

const debug = D("ciris:index.js");

servidor((app) => {
  const socket = iniciarOyente(app, io);
  debug("Inicializando las rutas");
  app.use("/api/auth", emailPass);
  app.use("/api/empleado", empleados(socket));
  app.use("/api/tarea", tareas);
  app.use("/api/mensaje", mensajes);
  app.use("/api/usuario", usuarios);

  revisarPorRoot();

  return app;
});

function iniciarOyente(app, socket) {
  const puerto = entorno.PUERTO;
  debug(`Servidor iniciado en puerto ${puerto}`);
  return socket.listen(app.listen(puerto));
}

function revisarPorRoot() {
  debug("Revisando por Root...");
  comun.findOne(null, { correo: "root" })
    .then(() => debug("Root encontrado!"))
    .catch(() => {
      debug("Root no encontrado, creando...");
      const usuarioRoot = {
        correo: "root",
        password: "cirisCiris.93",
        nombre: "root",
      };
      return comun.create(usuarioRoot).then(() => debug("Root creado!"));
    });
}
