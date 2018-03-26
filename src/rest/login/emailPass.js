import express from "express";
import mongoose from "mongoose";
import { crearJWT } from "./middleware.js";
import { modelo } from "../modelos/usuario.js";

const router = express.Router();

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
  return new Promise((resolve, reject) => {
    coleccion.findOne({
      correo,
      borrado: false,
    }, (errFind, encontrado) => {
      if (errFind) {
        reject({ message: errFind.message, status: 500 });
      }
      if (!encontrado) {
        reject({ message: "Usuario no encontrado", status: 401 });
      }
      resolve(encontrado);
    });
  });
}

function validarPassword(encontrado, password) {
  return new Promise((resolve, reject) => {
    encontrado.comparePassword(password, (errMatch, isMatch) => {
      if (errMatch) {
        return reject({ message: errMatch.message, status: 500 });
      }
      if (!isMatch) {
        return reject({ message: "Correo o password inválido", status: 401 });
      }
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
