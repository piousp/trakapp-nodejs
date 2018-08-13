import express from "express";
import D from "debug";
import map from "lodash/map";
import modeloUsuario from "../modelos/usuario.js";
import modeloCuenta from "../modelos/cuenta.js";
import mensaje from "../modelos/mensaje";
import funDB, { skipLimitABS } from "../comun-db.js";
import rutasGenericas, { ok, error } from "./_base.js";
import enviarCorreo from "../../util/correos";

const debug = D("ciris:rutas/usuario.js");

const router = express.Router();
const comunUsuario = funDB(modeloUsuario);
const comunCuenta = funDB(modeloCuenta);

router.get("/yo", getYo);
router.get("/cuenta", getCuenta);
router.get("/conmensajes", getConMensajes);
router.get("/listarPorCuenta", listarPorCuenta);
router.put("/cuenta", actualizarCuenta);
router.post("/reportarbug", reportarBug);


rutasGenericas(router, modeloUsuario);

export default router;

async function listarPorCuenta(req, res) {
  const paginacion = skipLimitABS(req.query);
  const usuarios = await comunUsuario.find({ cuentas: req.query.cuentaID }, paginacion, "cuentas");
  ok(res)(usuarios);
}

async function getConMensajes(req, res) {
  async function getCantMensajesNoVistos(e) {
    const cant = await mensaje.find({
      emisor: e._id,
      receptor: req.usuario,
      visto: false,
    }).count();
    e.cantMensajesNoVistos = cant;
    return e;
  }
  const usuarios = await modeloUsuario.find({
    cuenta: req.cuenta,
    borrado: false,
    activo: true,
  }).lean();
  const usuariosConMensajes = await Promise.all(map(usuarios, e => getCantMensajesNoVistos(e)));
  return res.json({ docs: usuariosConMensajes });
}


async function getYo(req, res) {
  const resp = await comunUsuario.findOne(req.usuario);
  res.json(resp);
}

async function getCuenta(req, res) {
  const resp = await comunCuenta.findOne(req.cuenta);
  res.json(resp);
}

async function actualizarCuenta(req, res) {
  debug("actualizarCuenta", req.body);
  const quer = { _id: req.cuenta, borrado: false };
  comunCuenta.findOneAndUpdate(null, req.body, quer)
    .then(ok(res))
    .catch(error(res));
}

function reportarBug(req, res) {
  return enviarCorreo({
    to: "soporte@ciriscr.com",
    from: `${req.body.usuario.nombre} ${req.body.usuario.apellidos} <${req.body.usuario.correo}>`,
    subject: req.body.subject,
    text: req.body.message,
  }).then(() => res.end());
}
