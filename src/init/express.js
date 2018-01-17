import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import D from "debug";
import _ from "lodash";
import entorno from "../entorno.js";
import pkgJson from "../../package.json";
import { estaAutorizado } from "../login/middleware.js";

const debug = D("ciris:rest/init.js");
debug("Iniciando el proceso");
const origenes = procesarOrigenes(entorno.ORIGIN);

export default function initApp(configRutas) {
  let app = express();
  app = configurarCors(app);
  app = configurarBodyParse(app);
  app = rutasBase(app);
  app = configRutas(app, estaAutorizado);
  return iniciarOyente(app);
}

function configurarCors(apCor) {
  const corsOptions = {
    origin: origenes,
    credentials: true,
  };

  debug("Configurando el CORS");
  apCor.options("*", cors(corsOptions));
  return apCor;
}


function configurarBodyParse(appBP) {
  debug("Configurando el servidor con el body parser de JSON");
  appBP.use(bodyParser.urlencoded({
    extended: true,
  }));
  appBP.use(bodyParser.json());
  return appBP;
}

function rutasBase(appRu) {
  debug("Configurando las rutas base");
  appRu.get("/", (req, res) => {
    const temp = {
      version: pkgJson.version,
      origins: origenes,
    };
    return res.json(temp);
  });

  appRu.use((req, res) => {
    res.status(404).send("Recurso no encontrado.");
  });

  appRu.use((err, req, res) => {
    if (err) {
      res.status(500).send();
    }
    res.status(500).send("Error del servidor");
  });
  return appRu;
}

function iniciarOyente(appO) {
  const puerto = entorno.PUERTO;
  appO.listen(puerto);
  debug(`Servidor iniciado en puerto ${puerto}`);
  return appO;
}

function procesarOrigenes(string) {
  debug(`Configurando los origenes ${string}`);
  const res = string.split(",");
  if (_.size(res) === 1) {
    return string;
  }
  return _.map(res, s => s.trim());
}
