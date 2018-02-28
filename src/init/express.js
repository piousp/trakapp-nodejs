import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import D from "debug";
import _ from "lodash";
import entorno from "../entorno.js";
import initDB from "./bd.js";
import pkgJson from "../../package.json";

const debug = D("ciris:init/express.js");
debug("Iniciando el proceso");
const origenes = procesarOrigenes(entorno.ORIGIN);

export default function initApp(configRutas) {
  debug("Booteando...");
  const pipe = _.flow([configurarCors, configurarBodyParse, configRutas, rutasBase, iniciarOyente]);
  initDB();
  return pipe(express());
}

function configurarCors(app) {
  const corsOptions = {
    origin: origenes,
    credentials: true,
  };

  debug("Configurando el CORS");
  const corsIns = cors(corsOptions);
  app.options("*", corsIns);
  app.use(corsIns);
  return app;
}


function configurarBodyParse(app) {
  debug("Configurando el servidor con el body parser de JSON");
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(bodyParser.json());
  return app;
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
