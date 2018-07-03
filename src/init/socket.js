import D from "debug";
import io from "socket.io";
import moment from "moment";
import filter from "lodash/filter";
import find from "lodash/find";
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
      debug("actualizarPosicion", usuario.ubicacion.pos.coordinates);
      const resp = await actualizarPosicion(usuario);
      debug("resp", JSON.stringify(resp));
      const yo = find(socketo.sockets.sockets, { username: usuario._id });
      yo.emit("actualizar", resp);
      return socketo.to(usuario.cuenta).emit("actualizar", resp);
    });
    dispositivo.on("sesionIniciada", (usuario) => {
      dispositivo.username = usuario._id;
      dispositivo.join(usuario.cuenta);
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
  return socketo;
}

async function actualizarPosicion(data) {
  const usuario = await cEmpleados.findOneFat(data._id);
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
      usuario.ubicacion.pos = pos;
      return usuario;
    }
  }
  debug("No hay que actualizar en BD. Retornando");
  usuario.ubicacion.pos = pos;
  return usuario;
}

function iniciarOyente(app) {
  const puerto = entorno.PUERTO;
  debug(`Socket iniciado en puerto ${puerto}`);
  return io.listen(app.listen(puerto));
}
