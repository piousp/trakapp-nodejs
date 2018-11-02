import express from "express";
import D from "debug";
import map from "lodash/map";
import { Types } from "mongoose";
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
router.get("/buscadorchat/:txt", buscarEnChat);
router.get("/buscador/:txt", buscarBase);
getID(router, modelo);

export default router;

async function listarCorreos(req, res) {
  debug("listarCorreos");
  try {
    const query = req.params.id !== "undefined" ? { cuentas: req.params.id, borrado: false } : { borrado: false };
    const empleados = await funBD(modelo).find(query);
    const correos = map(empleados.docs, "correo");
    ok(res)(correos);
  } catch (e) {
    error(res)(e);
  }
}

async function listarPorCuenta(req, res) {
  debug("listarPorCuenta");
  try {
    const paginacion = skipLimitABS(req.query);
    const empleados = await funBD(modelo).find({ cuenta: req.query.cuentaID }, paginacion);
    ok(res)(empleados);
  } catch (e) {
    error(res)(e);
  }
}

async function getConMensajes(req, res) {
  debug("getConMensajes");
  try {
    const empleados = await funBD(modelo).find({
      cuenta: req.cuenta,
      borrado: false,
      ubicacion: { $exists: true },
    }, req.query);
    const empleadosConMensajes =
    await Promise.all(map(empleados.docs, e => getCantMensajesNoVistos(e, req.usuario)));
    ok(res)({ docs: empleadosConMensajes, cant: empleados.cant });
  } catch (e) {
    error(res)(e);
  }
}

async function getCantMensajesNoVistos(ele, usuarioReq) {
  debug("getCantMensajesNoVistos");
  try {
    const cant = await mensaje.find({
      emisor: ele._id,
      receptor: usuarioReq,
      visto: false,
    }).count();
    ele.cantMensajesNoVistos = cant;
    return ele;
  } catch (e) {
    return e;
  }
}

async function postBase(req, res) {
  debug("Post base");
  try {
    req.body.password = generarPassword(5);
    req.body.cuenta = req.cuenta;
    const html = renderizarHtml("bienvenidoEmpleado.html", {
      admin_url: entorno.ADMIN_URL,
      correo_empleado: req.body.correo,
      password_empleado: req.body.password,
    });
    const usuNvo = await funBD(modelo).create(req.body);
    enviarCorreo({
      to: req.body.correo,
      subject: "Bienvenido a Trakapp!",
      html,
    });
    ok(res)(usuNvo);
  } catch (e) {
    error(res)(e);
  }
}

function generarPassword(cant) {
  debug("generarPassword");
  return Array(cant)
    .fill("23456789ABCDEFGHJKLMNPQRSTUVWXYZ")
    .map(arr => arr[Math.floor(Math.random() * arr.length)]).join("");
}

async function getYo(req, res) {
  debug("getYo");
  try {
    const resp = await modelo.findOne({ _id: req.usuario }, { password: 0 });
    ok(res)(resp);
  } catch (e) {
    error(res)(e);
  }
}

function buscar(query, paginacion) {
  const abs = skipLimitABS(paginacion);
  return modelo
    .aggregate(query)
    .skip(abs.total)
    .limit(abs.cantidad);
}

function getQueryBuscar(txt, cuenta) {
  return [
    {
      $project: {
        nombreCompleto: { $concat: ["$nombre", " ", "$apellidos"] },
        borrado: 1,
        cuenta: 1,
        nombre: 1,
        apellidos: 1,
        ubicacion: 1,
      },
    },
    {
      $match: {
        nombreCompleto: { $regex: txt, $options: "gi" },
        borrado: false,
        cuenta: Types.ObjectId(cuenta),
      },
    },
  ];
}

async function buscarBase(req, res) {
  try {
    const query = getQueryBuscar(req.params.txt, req.cuenta);
    const empleados = await buscar(query, req.query);
    return ok(res)(empleados);
  } catch (e) {
    return error(res)(e);
  }
}

async function buscarEnChat(req, res) {
  try {
    const query = getQueryBuscar(req.params.txt, req.cuenta);
    query[1].$match.ubicacion = { $exists: true };
    const empleados = await buscar(query, req.query);
    debug("Empleados encontrados:", empleados);
    const empleadosConMensajes =
    await Promise.all(map(empleados, e => getCantMensajesNoVistos(e, req.usuario)));
    return ok(res)({ docs: empleadosConMensajes });
  } catch (e) {
    debug("Error buscando empleados del chat", e);
    return error(res)(e);
  }
}
