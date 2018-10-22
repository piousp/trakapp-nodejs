import express from "express";
import D from "debug";
import map from "lodash/map";
import renderizarHtml from "../../util/renderizarHtml.js";
import modelo from "../modelos/empleado.js";
import mensaje from "../modelos/mensaje";
import { getID, getBase, putID, deleteID, ok, error } from "./_base";
import funBD, { skipLimitABS } from "../comun-db.js";
import enviarCorreo from "../../util/correos";
import entorno from "../../entorno.js";

const debug = D("ciris:rutas/empleado.js");

const router = express.Router();
getBase(router, modelo);
putID(router, modelo);
deleteID(router, modelo);

router.post("/", postBase);
router.get("/yo", getYo);
router.get("/conmensajes", getConMensajes);
router.get("/listarPorCuenta", listarPorCuenta);
router.get("/listarCorreos/:id", listarCorreos);

getID(router, modelo);

async function listarCorreos(req, res) {
  const query = req.params.id !== "undefined" ? { cuentas: req.params.id, borrado: false } : { borrado: false };
  const empleados = await funBD(modelo).find(query);
  const correos = map(empleados.docs, "correo");
  ok(res)(correos);
}

async function listarPorCuenta(req, res) {
  const paginacion = skipLimitABS(req.query);
  const empleados = await funBD(modelo).find({ cuenta: req.query.cuentaID }, paginacion);
  ok(res)(empleados);
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
  const empleados = await funBD(modelo).find({
    cuenta: req.cuenta,
    borrado: false,
  }, req.query);
  const empleadosConMensajes =
  await Promise.all(map(empleados.docs, e => getCantMensajesNoVistos(e)));
  return res.json({ docs: empleadosConMensajes, cant: empleados.cant });
}

function postBase(req, res) {
  debug("Post base");
  req.body.password = generarPassword(5);
  req.body.cuenta = req.cuenta;
  const html = renderizarHtml("bienvenidoEmpleado.html", {
    admin_url: entorno.ADMIN_URL,
    correo_empleado: req.body.correo,
    password_empleado: req.body.password,
  });
  funBD(modelo).create(req.body)
    .then((obj) => {
      res.json(obj);
      return enviarCorreo({
        to: req.body.correo,
        subject: "Bienvenido a Trakapp!",
        html,
      });
    })
    .catch(error(res));
}

function generarPassword(cant) {
  return Array(cant)
    .fill("23456789ABCDEFGHJKLMNPQRSTUVWXYZ")
    .map(arr => arr[Math.floor(Math.random() * arr.length)]).join("");
}

async function getYo(req, res) {
  const resp = await modelo.findOne({ _id: req.usuario }, { password: 0 });
  res.json(resp);
}

export default router;
