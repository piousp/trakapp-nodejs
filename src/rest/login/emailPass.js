import express from "express";
import D from "debug";
import moment from "moment";
import { crearJWT, estaAutorizado } from "./middleware.js";
import modeloUsuario from "../modelos/usuario.js";
import modeloEmpleado from "../modelos/empleado.js";
import modeloCuenta from "../modelos/cuenta.js";
import funBD from "../comun-db.js";
import modeloRecu from "../modelos/recuperacion.js";
import { ErrorMongo, UsuarioInvalido } from "../../util/errores.js";
import { encriptar } from "../modelos/encriptador.js";
import entorno from "../../entorno.js";
import enviarCorreo from "../../util/correos.js";

const debug = D("ciris:rest/login/emailPass.js");
const router = express.Router();

const comunUsuario = funBD(modeloUsuario);
const comunEmpleado = funBD(modeloEmpleado);
const comunCuenta = funBD(modeloCuenta);

router.post("/login/movil", login(comunEmpleado));
router.post("/login", login(comunUsuario));
router.post("/registro", registrar);
router.post("/solicitarCambio/movil", solicitarCambio);
router.post("/cambiarContrasena/movil/:id", recuperarContrasena(comunEmpleado));
router.post("/verificarPasswordCorrecto", estaAutorizado, verificarPasswordCorrecto);
router.post("/verificarPasswordCorrecto/movil", estaAutorizado, verificarPasswordCorrectoMovil);
router.post("/cambiarContrasena", estaAutorizado, cambiarContrasena(comunUsuario));
router.put("/actualizarContrasena/movil", estaAutorizado, cambiarContrasena(comunEmpleado));
router.get("/activacion/:id", activarCuenta);

function login(coleccion) {
  return (req, res) => {
    const query = { correo: req.body.login, borrado: false, activo: true };
    return loginGenerico(coleccion, query)(req, res);
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
    res.send(usuario);
    return enviarCorreo({
      to: usuario.usuario.correo,
      subject: "Confirme su cuenta",
      html: `
        <div>
          <h1>Hola, ${usuario.usuario.nombre}</h1>
          <p>Para activar su cuenta, haga click en el siguiente enlace:</p>
          <a href='${entorno.ORIGIN}/activacion/${usuario.usuario._id}'>
            ${entorno.ORIGIN}/activacion/${usuario.usuario._id}
          </a>
        </div>
      `,
    });
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
  debug("Creando usuario");
  const nuevoUsuario = {
    nombre: data.nombre,
    apellidos: data.apellidos,
    correo: data.correo,
    password: data.password,
    cuenta: idCuenta,
  };
  const usuario = await comunUsuario.create(nuevoUsuario);
  const token = crearJWT(usuario);
  const temp = usuario.toJSON();
  delete temp.password;
  return { usuario: temp, token };
}

function crearCuenta(data) {
  if (data.empresarial) {
    debug("Creando cuenta empresarial");
    const cuenta = {
      nombre: data.cuenta.nombre,
      correo: data.cuenta.correo,
      direccion: data.cuenta.direccion,
      cedula: data.cuenta.cedula,
    };
    return comunCuenta.create(cuenta);
  }
  debug("Creando cuenta personal");
  const cuenta = {
    nombre: data.nombre,
    correo: data.correo,
  };
  return comunCuenta.create(cuenta);
}

async function solicitarCambio(req, res) {
  debug("Solicitar cambio de password");
  try {
    debug("Buscando usuario");
    const usuario = await comunEmpleado.findOne(null, { correo: req.body.correo });
    if (!usuario) {
      debug("El usuario no existe");
      return res.status(404).send("El usuario no existe");
    }
    debug("Creando recuperación");
    const recu = await funBD(modeloRecu).create({ idUsuario: usuario._id, horaCreacion: moment() });
    const link = "Haga clic aqui para reestablecer su contraseña"
      .link(`${entorno.ORIGIN}/recuperacion/${recu._id}`);
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
    const resp = await enviarCorreo(data);
    debug(resp);
    return res.status(200).send("Se envió el correo para realizar el cambio de contraseña");
  } catch (err) {
    debug(err);
    if (err instanceof ErrorMongo) {
      return res.status(500).send(err.message);
    }
    return res.status(503).send(err.message);
  }
}

function recuperarContrasena(modelo) {
  return async (req, res) => {
    debug("recuperarContrasena");
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
      const user = await modelo.updateOne(
        recu.idUsuario,
        {
          password: await encriptar(req.body.password),
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

function verificarPasswordCorrecto(req, res) {
  debug("verificarPasswordCorrecto", req.usuario);
  return loginGenerico(comunUsuario, { _id: req.usuario })(req, res);
}

function verificarPasswordCorrectoMovil(req, res) {
  return loginGenerico(comunEmpleado, { _id: req.usuario })(req, res);
}

function loginGenerico(coleccion, queryUsuario) {
  return async function loginGenericoInterno(req, res) {
    debug("loginGenerico");
    try {
      const usuario = await coleccion.findOneFat(null, queryUsuario);
      if (usuario) {
        debug("Usuario obtenido");
        delete usuario.password;
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

function cambiarContrasena(coleccion) {
  return async function cambiarContrasenaInterno(req, res) {
    debug("cambiarContrasena");
    try {
      const user = await coleccion.updateOne(
        req.usuario,
        {
          password: await encriptar(req.body.password),
          nuevo: false,
        },
      );
      if (!user) {
        debug("Es usuario no existe");
        return res.status(404).send("Es usuario no existe");
      }
      return res.send("");
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

async function activarCuenta(req, res) {
  try {
    const usuario = await comunUsuario.findOne(null, { _id: req.params.id });
    if (!usuario) {
      return res.send("La cuenta que intenta activar no existe.");
    }
    if (usuario.activo) {
      return res.send("Esta cuenta ya fue verificada y se encuentra activa.");
    }
    await comunUsuario.updateOne(req.params.id, { activo: true });
    return res.json("Su cuenta ha sido verificada existosamente.");
  } catch (err) {
    if (err instanceof ErrorMongo) {
      return res.status(500).send(err.message);
    }
    return res.status(503).send(err.message);
  }
}

export default router;
