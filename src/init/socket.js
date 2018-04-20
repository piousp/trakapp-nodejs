import D from "debug";
import io from "socket.io";
import moment from "moment";
import filter from "lodash/filter";
import forEach from "lodash/forEach";
import entorno from "../entorno.js";
import funBD from "../rest/comun-db.js";
import empleado from "../rest/modelos/empleado.js";

const debug = D("ciris:init/socket.js");
const cEmpleados = funBD(empleado);

export default app => configurarOyentes(iniciarOyente(app));

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
    s.on("sesionIniciada", (usuario) => {
      s.username = usuario._id;
      debug(`El usuario con el id ${usuario._id} se ha conectado`);
    });
    s.on("mensajeEnviado", (mensaje) => {
      debug("Enviando mensaje solo a los receptores");
      const receptores = filter(socketo.sockets.sockets, { username: mensaje.receptor });
      forEach(receptores, r => r.emit("recibirMensaje", mensaje));
    });
  });
}

function iniciarOyente(app) {
  const puerto = entorno.PUERTO;
  debug(`Socket iniciado en puerto ${puerto}`);
  return io.listen(app.listen(puerto));
}
