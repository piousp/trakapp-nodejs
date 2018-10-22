import express from "express";
import D from "debug";
import map from "lodash/map";
import cuenta from "../modelos/cuenta.js";
import { getBase, putID, postBase, deleteID, ok, error } from "./_base.js";
import enviarCorreo from "../../util/correos";
import renderizarHtml from "../../util/renderizarHtml.js";
import entorno from "../../entorno.js";
import funDB from "../comun-db.js";

const debug = D("ciris:rutas/cuenta.js");

const Router = express.Router();
const comun = funDB(cuenta);

Router.get("/cargarBulk", cargarBulk);
Router.get("/listarCorreos", listarCorreos);
Router.get("/activa/", getCuentaActiva);
Router.get("/:id", getID);
getBase(Router, cuenta);
Router.put("/migrarEmpresarial/:id", migrarEmpresarial);
putID(Router, cuenta);
Router.post("/invitarUsuarios", invitarUsuarios);
postBase(Router, cuenta);
deleteID(Router, cuenta);

async function listarCorreos(req, res) {
  try {
    const cuentas = await comun.find({ borrado: false });
    const correos = map(cuentas.docs, "correo");
    ok(res)(correos);
  } catch (e) {
    error(res)(e);
  }
}

async function getCuentaActiva(req, res) {
  try {
    const resp = await comun.findOne(req.cuenta);
    ok(res)(resp);
  } catch (e) {
    error(res)(e);
  }
}

async function getID(req, res) {
  try {
    const resp = await comun.findOne(null, { _id: req.params.id, borrado: false });
    ok(res)(resp);
  } catch (e) {
    error(res)(e);
  }
}

async function invitarUsuarios(req, res) {
  try {
    const html = renderizarHtml("invitacionUnirse.html", {
      url_invitacion: `${entorno.ADMIN_URL}/invitacion/${req.body.cuenta._id}`,
      nombre_usuario: req.body.usuario.nombre,
      cuenta_nombre: req.body.cuenta.nombre,
    });
    const data = {
      to: req.body.correos.join(", "),
      subject: `¡${req.body.usuario.nombre} le ha invitado a Trakapp!`,
      html,
    };
    const resp = await enviarCorreo(data);
    debug(resp);
    return ok(res)("Se envió el correo invitando a los usuarios");
  } catch (err) {
    debug(err);
    return error(res)(err.message);
  }
}

async function cargarBulk(req, res) {
  try {
    const query = { _id: { $in: req.query.cuentas } };
    const cuentas = await comun.find(query);
    debug(cuentas);
    return ok(res)(cuentas);
  } catch (err) {
    debug(err);
    return error(res)(err.message);
  }
}

async function migrarEmpresarial(req, res) {
  try {
    const query = { $set: { empresarial: true } };
    const respCuenta = await comun.efectuarCambio(req.params.id, query);
    debug(respCuenta);
    return ok(res)(respCuenta);
  } catch (err) {
    debug(err);
    return error(res)(err.message);
  }
}


export default Router;
