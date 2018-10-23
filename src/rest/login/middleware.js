import jwt from "jwt-simple";
import moment from "moment";
import D from "debug";
import entorno from "../../entorno.js";

export { estaAutorizado, crearJWT, socketConfig };

const debug = D("ciris:rest/login/middleware.js");

function socketConfig(socketIO) {
  return (req, res, next) => {
    req.socketIO = socketIO;
    next();
  };
}

function estaAutorizado(req, res, next) {
  debug("Autorizando");
  if (!req.headers.authorization) {
    const resp = "El request no tiene un encabezado de Autorización";
    res.status(401).send(resp);
  }
  validar(req, res);
  next();
}

function validar(req, res) {
  debug("Validando");
  try {
    const payload = decodificar(token(req));
    if (payload.exp <= moment().unix()) {
      return res.status(401).send("Token expirado");
    }
    const separador = payload.sub.indexOf("|");
    req.cuenta = req.headers.cuenta;
    req.usuario = payload.sub.substring(separador + 1, payload.sub.length);
    return "";
  } catch (err) {
    return res.status(401).send(err.message);
  }
}

function token(req) {
  debug("Token");
  return req.headers.authorization.split(" ")[1];
}

function decodificar(tokenReq) {
  debug("Decodificar");
  return jwt.decode(tokenReq, entorno.TOKEN_SECRET);
}

function crearJWT(usuario) {
  debug("crearJWT");
  const payload = {
    sub: `${usuario._id}`,
    iat: moment().unix(),
    exp: moment().add(1, "years")
      .unix(),
  };
  return jwt.encode(payload, entorno.TOKEN_SECRET);
}
