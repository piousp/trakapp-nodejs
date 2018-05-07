import express from "express";
import modeloUsuario from "../modelos/usuario.js";
import modeloCuenta from "../modelos/cuenta.js";
import funDB from "../comun-db.js";
import rutasGenericas from "./_base.js";

const router = express.Router();
const comunUsuario = funDB(modeloUsuario);
const comunCuenta = funDB(modeloCuenta);

router.get("/yo", getYo);
router.get("/cuenta", getCuenta);

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
