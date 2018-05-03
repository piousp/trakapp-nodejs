import D from "debug";
import servidor from "./init/express.js";
import socket from "./init/socket.js";
import { estaAutorizado } from "./rest/login/middleware.js";
import emailPass from "./rest/login/emailPass.js";
import empleados from "./rest/rutas/empleado.js";
import tareas from "./rest/rutas/tarea.js";
import mensajes from "./rest/rutas/mensaje.js";
import usuarios from "./rest/rutas/usuario.js";
import recuperaciones from "./rest/rutas/recuperacion.js";

const debug = D("ciris:index.js");

servidor((app) => {
  debug("Inicializando las rutas");
  socket(app);
  app.use("/api/auth", emailPass);
  app.use("/api/recuperacion", recuperaciones);
  app.use("/api/empleado", estaAutorizado, empleados);
  app.use("/api/tarea", estaAutorizado, tareas);
  app.use("/api/mensaje", estaAutorizado, mensajes);
  app.use("/api/usuario", estaAutorizado, usuarios);
  return app;
});
