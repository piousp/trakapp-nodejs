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
  socketo.on("connect", (dispositivo) => {
    dispositivo.on("actualizarPosicion", async (usuario) => {
      debug("evento de actualizarPosicion con el id", usuario._id);
      dispositivo.username = usuario._id;
      const resp = await actualizarPosicion(usuario);
      debug("resp", JSON.stringify(resp));
      return socketo.sockets.emit("actualizar", resp);
    });
    dispositivo.on("sesionIniciada", (usuario) => {
      dispositivo.username = usuario._id;
      debug(`El usuario con el id ${usuario._id} se ha conectado`);
    });
    dispositivo.on("mensajeEnviado", (mensaje) => {
      debug("Enviando mensaje solo a los receptores");
      const receptores = filter(socketo.sockets.sockets, { username: mensaje.receptor });
      forEach(receptores, r => r.emit("recibirMensaje", mensaje));
    });
    dispositivo.on("broadcastEnviado", (mensaje) => {
      dispositivo.broadcast.emit("recibirBroadcast", mensaje);
    });
  });
}

async function actualizarPosicion(data) {
  const nvaFecha = moment(data.ubicacion.lastUpdate, "YYYY-MM-DDTHH:mm:ss.SSSSZ").add(1, "m");
  const pos = {
    type: "Point",
    coordinates: data.ubicacion.pos.coordinates,
  };
  // Verificando fecha 2018-04-25T22:49:12.181Z 2018-04-25T17:04:12-06:00
  debug("Verificando fecha", moment().format(), nvaFecha.format(), moment().isAfter(nvaFecha));
  if (data._id && (!data.ubicacion.lastUpdate || moment().isAfter(nvaFecha))) {
    debug("Se debe actualizar la ubicación del empleado");

    const ubicacion = {
      lastUpdate: moment(),
      pos,
    };
    try {
      const empResp = await cEmpleados.findOneAndUpdate(data._id, { $set: { ubicacion } });
      delete empResp.password;
      debug("***UBICACIÓN ACTUALIZADA***");
      return empResp;
    } catch (err) {
      debug("Estalló:", err);
      data.ubicacion.pos = pos;
      return data;
    }
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
