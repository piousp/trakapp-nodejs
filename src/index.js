import D from "debug";
import servidor from "./init/express.js";
import socket from "./init/socket.js";
import { estaAutorizado, socketConfig } from "./rest/login/middleware.js";
import emailPass from "./rest/login/emailPass.js";
import empleados from "./rest/rutas/empleado.js";
import tareas from "./rest/rutas/tarea.js";
import mensajes from "./rest/rutas/mensaje.js";
import usuarios from "./rest/rutas/usuario.js";
import recuperaciones from "./rest/rutas/recuperacion.js";
import clientes from "./rest/rutas/cliente.js";
import cuentas from "./rest/rutas/cuenta.js";
import correos from "./rest/rutas/correo.js";
import reportes from "./rest/rutas/reporte.js";
import rutas from "./rest/rutas/ruta.js";
import firebaseAdmin from "./util/pushNotifications";

const debug = D("ciris:index.js");

servidor((app) => {
  debug("Inicializando las rutas");
  const io = socket(app);
  firebaseAdmin();
  app.use("/api/auth", emailPass);
  app.use("/api/recuperacion", recuperaciones);
  app.use("/api/empleado", estaAutorizado, empleados);
  app.use("/api/tarea", estaAutorizado, socketConfig(io), tareas);
  app.use("/api/mensaje", estaAutorizado, mensajes);
  app.use("/api/usuario", estaAutorizado, usuarios);
  app.use("/api/cliente", estaAutorizado, clientes);
  app.use("/api/cuenta", estaAutorizado, cuentas);
  app.use("/api/correo", estaAutorizado, correos);
  app.use("/api/reporte", estaAutorizado, reportes);
  app.use("/api/ruta", estaAutorizado, rutas);
  return app;
});
