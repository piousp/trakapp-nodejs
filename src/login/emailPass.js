import express from "express";
import mongoose from "mongoose";
import D from "debug";
import { crearJWT } from "./middleware.js";
import { modelo } from "../modelos/usuario.js";

const router = express.Router();
const debug = D("ciris:login/emailPass.js");


router.post("/login", login(modelo));
router.post("/registro", registrar(modelo));

function login(coleccion) {
  return (req, res) => {
    debug("Iniciando pedido de login");
    obtenerUsuario(coleccion, req.body.login)
      .then(usuarioBD => validarPassword(usuarioBD, req.body.password))
      .then((resp) => {
        debug(`Esta es la respuesta correcta ${resp.data}`);
        res.send(resp);
      })
      .catch((err) => {
        const coco = JSON.stringify(err);
        debug(`Este es el puto error ${coco}`);
        res.status(err.status).send(err.message);
      });
  };
}

function registrar(coleccion) {
  return (req, res) => {
    existeUsuario(coleccion, req.body.correo)
      .then(() => crearUsuario(coleccion, req.body))
      .then((resp) => {
        res.send(resp);
      })
      .catch((err) => {
        res.status(err.status).send(err.message);
      });
  };
}

function obtenerUsuario(coleccion, correo) {
  debug("Buscando el usuario");
  return new Promise((resolve, reject) => {
    coleccion.findOne({
      correo,
      borrado: false,
    }, (errFind, encontrado) => {
      debug("La bd contestó, analizando respuesta");
      if (errFind) {
        debug("Algo pasó:", errFind);
        reject({ message: errFind.message, status: 500 });
      }
      if (!encontrado) {
        debug("El bicho que bnusca no existe");
        reject({ message: "Usuario no encontrado", status: 401 });
      }
      debug("No hay errores, entonces si sirvió", encontrado);
      resolve(encontrado);
    });
  });
}

function validarPassword(encontrado, password) {
  debug("El validando el puto password");
  return new Promise((resolve, reject) => {
    debug(encontrado.comparePassword);
    encontrado.comparePassword(password, (errMatch, isMatch) => {
      debug("validando el password con lo encontrado");
      if (errMatch) {
        debug("Algo pasó", errMatch);
        return reject({ message: errMatch.message, status: 500 });
      }
      if (!isMatch) {
        debug("Password no coincide");
        return reject({ message: "Correo o password inválido", status: 401 });
      }
      debug("Creando el JWT");
      const token = crearJWT(encontrado);
      const temp = encontrado.toJSON();
      delete temp.password;
      return resolve({ usuario: temp, token });
    });
  });
}

function crearUsuario(Coleccion, data) {
  return new Promise(((resolve, reject) => {
    const nuevo = new Coleccion(data);
    nuevo._id = new mongoose.Types.ObjectId();
    nuevo.save(data, (errSave, result) => {
      if (errSave) {
        return reject({ message: errSave.message, status: 500 });
      }
      const token = crearJWT(result);
      const temp = result.toJSON();
      delete temp.password;
      return resolve({ usuario: temp, token });
    });
  }));
}

function existeUsuario(coleccion, correo) {
  return new Promise(((resolve, reject) => {
    coleccion.findOne({
      correo,
      borrado: false,
    }, (errFind, encontrado) => {
      if (errFind) {
        return reject({ message: errFind.message, status: 500 });
      }
      if (encontrado) {
        return reject({ message: "El correo ya existe", status: 409 });
      }
      return resolve(true);
    });
  }));
}

export default router;
