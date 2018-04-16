import D from "debug";
import io from "socket.io";
import moment from "moment";
import servidor from "./init/express.js";
import { estaAutorizado } from "./rest/login/middleware.js";
import emailPass from "./rest/login/emailPass.js";
import empleados from "./rest/rutas/empleado.js";
import tareas from "./rest/rutas/tarea.js";
import mensajes from "./rest/rutas/mensaje.js";
import usuarios from "./rest/rutas/usuario.js";
import entorno from "./entorno.js";

const debug = D("ciris:index.js");

servidor((app) => {
  const socketo = iniciarOyente(app, io);
  debug("Inicializando las rutas");
  configurarOyentes(socketo);
  app.use("/api/auth", emailPass);
  app.use("/api/empleado", estaAutorizado, empleados);
  app.use("/api/tarea", estaAutorizado, tareas);
  app.use("/api/mensaje", estaAutorizado, mensajes);
  app.use("/api/usuario", estaAutorizado, usuarios);

  return app;
});

function configurarOyentes(socketo) {
  socketo.on("connect", (s) => {
    s.on("actualizarPosicion", (data) => {
      const nvaFecha = moment(data.position.lastUpdate).add(30, "m");
      if (data.position.lastUpdate && moment().isAfter(nvaFecha)) {
        data.position.lastUpdate = moment();
        return cEmpleados.findOneAndUpdate(data._id, data).then((resp) => {
          delete resp.password;
          return socketo.sockets.emit("actualizarPosicion", resp);
        });
      }
      return socketo.sockets.emit("actualizarPosicion", data);
    });
  });
}

function iniciarOyente(app, socket) {
  const puerto = entorno.PUERTO;
  debug(`Servidor iniciado en puerto ${puerto}`);
  return socket.listen(app.listen(puerto));
}
