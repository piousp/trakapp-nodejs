import express from "express";
import mongoose from "mongoose";
import D from "debug";
import constant from "lodash/constant";
import { crearJWT } from "./middleware.js";
import modeloUsuario from "../modelos/usuario.js";
import modeloEmpleado from "../modelos/empleado";
import { procesarBusqueda } from "../comun-db";
import { ErrorMongo, UsuarioInvalido } from "../../util/errores";

const debug = D("ciris:rest/login/emailPass.js");
const router = express.Router();

router.post("/login/movil", login(modeloEmpleado));
router.post("/login", login(modeloUsuario));
router.post("/registro", registrar(modeloUsuario));

function login(coleccion) {
  return async (req, res) => {
    try {
      debug("Realizando la acción de login");
      const usuario = await obtenerUsuario(coleccion, req.body.login);
      debug("Usuario obtenido");
      const token = await validarPassword(usuario, req.body.password);
      debug(token);
      res.send(token);
    } catch (err) {
      debug(err);
      res.status(503).send(err.message);
    }
  };
}

function registrar(coleccion) {
  return (req, res) => {
    existeUsuario(coleccion, req.body.correo)
      .then(() => crearUsuario(coleccion, req.body))
      .then(resp => res.send(resp))
      .catch((err) => {
        res.status(503).send(err.message);
      });
  };
}

function obtenerUsuario(coleccion, correo) {
  const docs = coleccion.findOne({ correo, borrado: false });
  return procesarBusqueda(docs.exec());
}

async function validarPassword(usuario, password) {
  try {
    debug("Usuario encontrado, comparando el passwd");
    const passwdValido = await usuario.comparePassword(password);
    if (passwdValido) {
      const token = crearJWT(usuario);
      const temp = usuario.toJSON();
      delete temp.password;
      return { usuario: temp, token };
    }
    throw new UsuarioInvalido();
  } catch (err) {
    debug(err);
    throw new ErrorMongo(`mensajeError: ${err}`);
  }
}

async function crearUsuario(Coleccion, data) {
  try {
    const nuevo = new Coleccion(data);
    nuevo._id = new mongoose.Types.ObjectId();
    const resultadoGuardar = await nuevo.save(data);
    const token = crearJWT(resultadoGuardar);
    const temp = resultadoGuardar.toJSON();
    delete temp.password;
    return { usuario: temp, token };
  } catch (errSave) {
    debug(errSave);
    throw new ErrorMongo(`mensajeError: ${errSave}`);
  }
}

function existeUsuario(coleccion, correo) {
  const docs = coleccion.findOne({ correo, borrado: false });
  return procesarBusqueda(docs.exec).then(constant(true));
}

export default router;
