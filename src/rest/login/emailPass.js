import express from "express";
import D from "debug";
import { crearJWT } from "./middleware.js";
import modeloUsuario from "../modelos/usuario.js";
import modeloEmpleado from "../modelos/empleado.js";
import modeloCliente from "../modelos/cliente.js";
import funBD from "../comun-db.js";
import { ErrorMongo, UsuarioInvalido } from "../../util/errores.js";

const debug = D("ciris:rest/login/emailPass.js");
const router = express.Router();

router.post("/login/movil", login(modeloEmpleado));
router.post("/login", login(modeloUsuario));
router.post("/registro", registrar);

function login(coleccion) {
  return async (req, res) => {
    try {
      debug("Realizando la acción de login");
      const usuario = await funBD(coleccion)
        .findOneFat(null, { correo: req.body.login, borrado: false });
      if (usuario) {
        debug("Usuario obtenido");
        const token = await validarPassword(usuario, req.body.password);
        return res.send(token);
      }
      return res.status(400).send("Credenciales inválidos");
    } catch (err) {
      debug(err);
      if (err instanceof UsuarioInvalido) {
        return res.status(400).send(err.message);
      }
      if (err instanceof ErrorMongo) {
        return res.status(500).send(err.message);
      }
      return res.status(503).send(err.message);
    }
  };
}

async function registrar(req, res) {
  try {
    debug("Realizando la acción de registrar");
    const existe = await existeUsuario(req.body.correo);
    debug("Usuario existe: ", existe);
    if (existe) {
      return res.status(409).send("El usuario ya existe");
    }
    const cliente = await crearCliente(req.body);
    const usuario = await crearUsuario(req.body, cliente._id);
    debug("Usuario creado");
    return res.send(usuario);
  } catch (err) {
    debug(err);
    if (err instanceof UsuarioInvalido) {
      return res.status(400).send(err.message);
    }
    if (err instanceof ErrorMongo) {
      return res.status(500).send(err.message);
    }
    return res.status(503).send(err.message);
  }
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

async function crearUsuario(data, idCliente) {
  const bd = funBD(modeloUsuario);
  debug("Creando usuario");
  const nuevoUsuario = {
    nombre: data.nombre,
    correo: data.correo,
    password: data.password,
    cliente: idCliente,
  };
  const usuario = await bd.create(nuevoUsuario);
  const token = crearJWT(usuario);
  const temp = usuario.toJSON();
  delete temp.password;
  return { usuario: temp, token };
}

function crearCliente(data) {
  const bd = funBD(modeloCliente);
  if (data.empresarial) {
    debug("Creando cliente empresarial");
    const cliente = {
      nombre: data.cliente.nombre,
      correo: data.cliente.correo,
      direccion: data.cliente.direccion,
      cedula: data.cliente.cedula,
    };
    return bd.create(cliente);
  }
  debug("Creando cliente personal");
  const cliente = {
    nombre: data.nombre,
    correo: data.correo,
  };
  return bd.create(cliente);
}

async function existeUsuario(correo) {
  const conteo = await funBD(modeloUsuario).count({ correo, borrado: false });
  return conteo > 0;
}

export default router;
