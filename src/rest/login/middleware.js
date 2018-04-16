import jwt from "jwt-simple";
import moment from "moment";
import entorno from "../../entorno.js";

export { estaAutorizado, crearJWT };

function estaAutorizado(req, res, next) {
  if (!req.headers.authorization) {
    const resp = "El request no tiene un encabezado de Autorización";
    res.status(401).send(resp);
  }
  validar(req, res);
  next();
}

function validar(req, res) {
  try {
    const payload = decodificar(token(req));
    if (payload.exp <= moment().unix()) {
      return res.status(401).send("Token expirado");
    }
    const separador = payload.sub.indexOf("|");
    req.cliente = payload.sub.substring(0, separador);
    req.usuario = payload.sub.substring(separador + 1, payload.sub.length);
    return "";
  } catch (err) {
    return res.status(401).send(err.message);
  }
}

function token(req) {
  return req.headers.authorization.split(" ")[1];
}

function decodificar(tokenReq) {
  return jwt.decode(tokenReq, entorno.TOKEN_SECRET);
}

function crearJWT(usuario) {
  const payload = {
    sub: `${usuario.cliente}|${usuario._id}`,
    iat: moment().unix(),
    exp: moment().add(1, "years")
      .unix(),
  };
  return jwt.encode(payload, entorno.TOKEN_SECRET);
}
