import express from "express";
import D from "debug";
import map from "lodash/map";
import modeloUsuario from "../modelos/usuario.js";
import mensaje from "../modelos/mensaje";
import funDB, { skipLimitABS } from "../comun-db.js";
import rutasGenericas, { ok, error } from "./_base.js";
import enviarCorreo from "../../util/correos";

const debug = D("ciris:rutas/usuario.js");

const router = express.Router();
const comunUsuario = funDB(modeloUsuario);

router.get("/yo", getYo);
router.get("/conmensajes", getConMensajes);
router.get("/listarPorCuenta", listarPorCuenta);
router.get("/listarCorreos/:id", listarCorreos);
router.post("/reportarbug", reportarBug);

rutasGenericas(router, modeloUsuario);

export default router;

async function listarCorreos(req, res) {
  debug("Listando Correos");
  try {
    const query = req.params.id !== "undefined" ? { cuentas: req.params.id, borrado: false } : { borrado: false };
    const usuarios = await comunUsuario.find(query);
    const correos = map(usuarios.docs, "correo");
    ok(res)(correos);
  } catch (e) {
    error(res)(e);
  }
}

async function listarPorCuenta(req, res) {
  debug("Listando por cuenta");
  try {
    const paginacion = skipLimitABS(req.query);
    const usuarios = await comunUsuario.find({ cuentas: req.query.cuentaID }, paginacion, "cuentas");
    ok(res)(usuarios);
  } catch (e) {
    error(res)(e);
  }
}

async function getConMensajes(req, res) {
  debug("Get con mensajes");
  async function getCantMensajesNoVistos(e) {
    const cant = await mensaje.find({
      emisor: e._id,
      receptor: req.usuario,
      visto: false,
    }).count();
    e.cantMensajesNoVistos = cant;
    return e;
  }
  try {
    const usuarios = await modeloUsuario.find({
      cuentas: req.cuenta,
      borrado: false,
      activo: true,
    }).lean();
    const usuariosConMensajes = await Promise.all(map(usuarios, e => getCantMensajesNoVistos(e)));
    return ok(res)({ docs: usuariosConMensajes });
  } catch (e) {
    return error(res)(e);
  }
}

async function getYo(req, res) {
  debug("Get Yo");
  try {
    const resp = await comunUsuario.findOne(req.usuario);
    ok(res)(resp);
  } catch (e) {
    error(res)(e);
  }
}

function reportarBug(req, res) {
  debug("Reportando bug");
  try {
    return enviarCorreo({
      to: "soporte@ciriscr.com",
      from: `${req.body.usuario.nombre} ${req.body.usuario.apellidos} <${req.body.usuario.correo}>`,
      subject: req.body.subject,
      text: req.body.message,
    }).then(() => ok(res)("Se envió el correo"));
  } catch (e) {
    return error(res)(e);
  }
}
