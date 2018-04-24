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
      debug("evento de actualizarPosicion");
      const resp = actualizarPosicion(data);
      return socketo.sockets.emit("actualizarPosicion", resp);
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

async function actualizarPosicion(data) {
  const nvaFecha = moment(data.ubicacion.lastUpdate).add(15, "m");
  const pos = {
    type: "Point",
    coordinates: [data.ubicacion.lng, data.ubicacion.lat],
  };
  if (!data.ubicacion.lastUpdate || moment().isAfter(nvaFecha)) {
    debug("Se debe actualizar la ubicación del empleado");

    const ubicacion = {
      lastUpdate: moment(),
      pos,
    };
    const empResp = await cEmpleados.findOneAndUpdate(data._id, { $set: { ubicacion } });
    delete empResp.password;
    return empResp;
  }
  debug("No hay que actualizar en BD. Retornando");
  data.ubicacion.pos = pos;
  return data;
}

function iniciarOyente(app) {
  const puerto = entorno.PUERTO;
  debug(`Socket iniciado en puerto ${puerto}`);
  return io.listen(app.listen(puerto));
}
