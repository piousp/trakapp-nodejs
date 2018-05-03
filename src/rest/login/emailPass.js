import express from "express";
import D from "debug";
import bcrypt from "bcrypt";
import util from "util";
import moment from "moment";
import { crearJWT } from "./middleware.js";
import modeloUsuario from "../modelos/usuario.js";
import modeloEmpleado from "../modelos/empleado.js";
import modeloCuenta from "../modelos/cuenta.js";
import funBD from "../comun-db.js";
import modeloRecu from "../modelos/recuperacion.js";
import { ErrorMongo, UsuarioInvalido } from "../../util/errores.js";

import enviarCorreo from "../../util/correos.js";

const debug = D("ciris:rest/login/emailPass.js");
const router = express.Router();
const SALT_WORK_FACTOR = 10;

router.post("/login/movil", login(modeloEmpleado));
router.post("/login", login(modeloUsuario));
router.post("/registro", registrar);
router.post("/solicitarCambio/movil", solicitarCambio);
router.post("/cambiarContrasena/movil/:id", cambiarContrasena(modeloEmpleado));

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
    const cuenta = await crearCuenta(req.body);
    const usuario = await crearUsuario(req.body, cuenta._id);
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
    debug("Usuario encontrado, comparando el password");
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

async function crearUsuario(data, idCuenta) {
  const bd = funBD(modeloUsuario);
  debug("Creando usuario");
  const nuevoUsuario = {
    nombre: data.nombre,
    correo: data.correo,
    password: data.password,
    cuenta: idCuenta,
  };
  const usuario = await bd.create(nuevoUsuario);
  const token = crearJWT(usuario);
  const temp = usuario.toJSON();
  delete temp.password;
  return { usuario: temp, token };
}

function crearCuenta(data) {
  const bd = funBD(modeloCuenta);
  if (data.empresarial) {
    debug("Creando cuenta empresarial");
    const cuenta = {
      nombre: data.cuenta.nombre,
      correo: data.cuenta.correo,
      direccion: data.cuenta.direccion,
      cedula: data.cuenta.cedula,
    };
    return bd.create(cuenta);
  }
  debug("Creando cuenta personal");
  const cuenta = {
    nombre: data.nombre,
    correo: data.correo,
  };
  return bd.create(cuenta);
}

async function solicitarCambio(req, res) {
  debug("Solicitar cambio de password");
  try {
    debug("Buscando usuario");
    const usuario = await funBD(modeloEmpleado).findOne(null, { correo: req.body.correo });
    if (!usuario) {
      debug("El usuario no existe");
      return res.status(404).send("El usuario no existe");
    }
    debug("Creando recuperación");
    const recu = await funBD(modeloRecu).create({ idUsuario: usuario._id, horaCreacion: moment() });
    const link = "Haga clic aqui para reestablecer su contraseña"
      .link(`http://trakapp.ciriscr.com/recuperacion/${recu._id}`);
    const data = {
      to: usuario.correo,
      subject: "Recuperación de cuenta",
      html: "<div>" +
        `<h1>Hola, ${usuario.nombre}</h1>` +
        `<p>Este correo fue generado porque se solicitó una recuperación de cuenta. Por favor haga clic en el siguiente link para reestablecer la contraseña (Este link es valido por 24h)</p><br>${link
        }<br><p>Si ud no solicitó este correo, haga caso omiso.</p>` +
      "</div>",
    };
    debug("Recuperación creada, enviando");
    enviarCorreo(data);
    return res.status(200).send("Se envió el correo para realizar el cambio de contraseña");
  } catch (err) {
    debug(err);
    if (err instanceof ErrorMongo) {
      return res.status(500).send(err.message);
    }
    return res.status(503).send(err.message);
  }
}

function cambiarContrasena(modelo) {
  return async (req, res) => {
    debug("Cambiar contraseña");
    try {
      debug("Buscando recuperacion");
      const recu = await funBD(modeloRecu).findOne(req.params.id);
      if (!recu) {
        debug("No existe esa recuperacion");
        return res.status(404).send("No existe esa recuperacion");
      }
      if (moment().diff(moment(recu.horaCreacion), "days") !== 0) {
        debug("Esa recuperacion ya está expirada");
        return res.status(404).send("Esa recuperacion ya está expirada");
      }
      const salt = await util.promisify(bcrypt.genSalt)(SALT_WORK_FACTOR);
      const hash = await util.promisify(bcrypt.hash)(req.body.password, salt);
      const user = await funBD(modelo).updateOne(
        recu.idUsuario,
        {
          password: hash,
        },
      );
      if (!user) {
        debug("Es usuario no existe");
        return res.status(404).send("Es usuario no existe");
      }
      await funBD(modeloRecu).efectuarCambio(req.params.id, { $set: { activo: false } });
      debug("Se cambió exitosamente la contraseña");
      return res.status(200).send("Se cambió exitaosamente la contraseña");
    } catch (err) {
      debug(err);
      if (err instanceof ErrorMongo) {
        return res.status(500).send(err.message);
      }
      return res.status(503).send(err.message);
    }
  };
}

async function existeUsuario(correo) {
  const conteo = await funBD(modeloUsuario).count({ correo, borrado: false });
  return conteo > 0;
}

export default router;
