import express from "express";
import mongoose from "mongoose";
import pify from "pify";
import D from "debug";
import constant from "lodash/constant";
import { crearJWT } from "./middleware.js";
import { modelo } from "../modelos/usuario.js";
import { empleado } from "../modelos/empleado";
import { procesarBusqueda } from "../comun-db";
import { ErrorMongo, UsuarioInvalido } from "../../util/errores";

const debug = D("ciris:rest/login/emailPass.js");
const router = express.Router();

router.post("/login/movil", login(empleado));
router.post("/login", login(modelo));
router.post("/registro", registrar(modelo));

function login(coleccion) {
  return (req, res) => {
    obtenerUsuario(coleccion, req.body.login)
      .then(usuarioBD => validarPassword(usuarioBD, req.body.password))
      .then(resp => res.send(resp))
      .catch((err) => {
        res.status(err.status).send(err.message);
      });
  };
}

function registrar(coleccion) {
  return (req, res) => {
    existeUsuario(coleccion, req.body.correo)
      .then(() => crearUsuario(coleccion, req.body))
      .then(resp => res.send(resp))
      .catch((err) => {
        res.status(err.status).send(err.message);
      });
  };
}

function obtenerUsuario(coleccion, correo) {
  const docs = coleccion.findOne({ correo, borrado: false });
  return procesarBusqueda(docs.exec);
}

function validarPassword(encontrado, password) {
  return pify(encontrado.comparePassword)(password).then((errMatch, isMatch) => {
    if (errMatch) {
      debug(errMatch);
      throw new ErrorMongo(`mensajeError: ${errMatch}`);
    }
    if (!isMatch) {
      throw new UsuarioInvalido();
    }
    const token = crearJWT(encontrado);
    const temp = encontrado.toJSON();
    delete temp.password;
    return { usuario: temp, token };
  });
}

function crearUsuario(Coleccion, data) {
  const nuevo = new Coleccion(data);
  nuevo._id = new mongoose.Types.ObjectId();
  return pify(nuevo.save)(data).then((errSave, result) => {
    if (errSave) {
      debug(errSave);
      throw new ErrorMongo(`mensajeError: ${errSave}`);
    }
    const token = crearJWT(result);
    const temp = result.toJSON();
    delete temp.password;
    return { usuario: temp, token };
  });
}

function existeUsuario(coleccion, correo) {
  const docs = coleccion.findOne({ correo, borrado: false });
  return procesarBusqueda(docs.exec).then(constant(true));
}

export default router;
