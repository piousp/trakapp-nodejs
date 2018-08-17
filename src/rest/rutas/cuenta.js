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
Router.get("/:id", getID);
getBase(Router, cuenta);
putID(Router, cuenta);
Router.post("/invitarUsuarios", invitarUsuarios);
postBase(Router, cuenta);
deleteID(Router, cuenta);

async function listarCorreos(req, res) {
  const cuentas = await comun.find({ borrado: false });
  const correos = map(cuentas.docs, "correo");
  ok(res)(correos);
}

function getID(req, res) {
  comun.findOne(null, { _id: req.params.id, borrado: false })
    .then(ok(res))
    .catch(error(res));
}

async function invitarUsuarios(req, res) {
  try {
    const html = renderizarHtml("invitacionUnirse.html", {
      url_invitacion: `${entorno.ADMIN_URL}/invitacion/${req.body.usuario.cuenta._id}`,
      nombre_usuario: req.body.usuario.nombre,
      cuenta_nombre: req.body.usuario.cuenta.nombre,
    });
    const data = {
      to: req.body.correos.join(", "),
      subject: `¡${req.body.usuario.nombre} le ha invitado a Trakapp!`,
      html,
    };
    const resp = await enviarCorreo(data);
    debug(resp);
    return res.status(200).send("Se envió el correo invitando a los usuarios");
  } catch (err) {
    debug(err);
    return res.status(500).send(err.message);
  }
}

async function cargarBulk(req, res) {
  try {
    const query = { _id: { $in: req.query.cuentas } };
    const cuentas = await comun.find(query);
    debug(cuentas);
    return res.json(cuentas);
  } catch (err) {
    debug(err);
    return res.status(500).send(err.message);
  }
}


export default Router;
