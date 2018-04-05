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


const debug = D("ciris:index.js");

servidor((app) => {
  const socket = iniciarOyente(app, io);
  debug("Inicializando las rutas");
  app.use("/api/auth", emailPass);
  app.use("/api/empleado", empleados(socket));
  app.use("/api/tarea", tareas);
  app.use("/api/mensaje", mensajes);
  app.use("/api/usuario", usuarios);

  return app;
});

function iniciarOyente(app, socket) {
  const puerto = entorno.PUERTO;
  debug(`Servidor iniciado en puerto ${puerto}`);
  return socket.listen(app.listen(puerto));
}
