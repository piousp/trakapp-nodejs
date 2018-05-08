import express from "express";
import orderBy from "lodash/orderBy";
import D from "debug";
import mensaje from "../modelos/mensaje.js";
import funDB from "../comun-db.js";
import { error } from "./_base";

const debug = D("ciris:mensajes");
const router = express.Router();
const comun = funDB(mensaje);

router.get("/privado/:receptor", getPrivado);
router.get("/publico/", getPublico);
router.post("/", postBase);

async function postBase(req, res) {
  req.body.cuenta = req.cuenta;
  try {
    const nuevoDoc = await comun.create(req.body);
    const docPopulado = await mensaje.findOne({ _id: nuevoDoc._id }).populate("emisor").lean();
    return res.send(docPopulado);
  } catch (e) {
    return error(res);
  }
}

async function getPrivado(req, res) {
  const query = {
    borrado: false,
    emisor: { $in: [req.query.emisor, req.params.receptor] },
    receptor: { $in: [req.query.emisor, req.params.receptor] },
  };
  try {
    const msjs = await getMensajes(query, req.query);
    return res.send(msjs);
  } catch (e) {
    return error(res);
  }
}

async function getPublico(req, res) {
  try {
    const msjs = await getMensajes({ borrado: false, receptor: { $exists: false } }, req.query);
    return res.send(msjs);
  } catch (e) {
    return error(res);
  }
}

async function getMensajes(query, paginacion) {
  try {
    const msjs = await mensaje
      .find(query)
      .sort({ fechaEnvio: -1 })
      .populate("emisor")
      .skip(parseInt(paginacion.cargados || 0, 10))
      .limit(parseInt(paginacion.cantidad || 0, 10))
      .lean();
    const cant = await comun.count(query);
    debug("Imprimiendo cantidad", cant);
    const docs = orderBy(msjs, "fechaEnvio", "asc");
    return { docs, cant };
  } catch (e) {
    return e;
  }
}

export default router;
