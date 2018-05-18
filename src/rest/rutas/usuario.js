import express from "express";
import D from "debug";
import modeloUsuario from "../modelos/usuario.js";
import modeloCuenta from "../modelos/cuenta.js";
import funDB from "../comun-db.js";
import rutasGenericas, { ok, error } from "./_base.js";

const debug = D("ciris:rutas/usuario.js");

const router = express.Router();
const comunUsuario = funDB(modeloUsuario);
const comunCuenta = funDB(modeloCuenta);

router.get("/yo", getYo);
router.get("/cuenta", getCuenta);
router.put("/cuenta", actualizarCuenta);

rutasGenericas(router, modeloUsuario);

export default router;

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
