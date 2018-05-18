import express from "express";
import orderBy from "lodash/orderBy";
import cloneDeep from "lodash/cloneDeep";
import assign from "lodash/assign";
import D from "debug";
import mensaje from "../modelos/mensaje.js";
import funDB from "../comun-db.js";
import { enviarPush } from "../../util/pushNotifications";
import { ok, error } from "./_base";
import empleado from "../modelos/empleado.js";

const debug = D("ciris:rutas/mensaje.js");
const router = express.Router();
const comun = funDB(mensaje);

router.get("/privado/:receptor", getPrivado);
router.get("/publico/", getPublico);
router.post("/", postBase);
router.put("/marcarvistos/:emisor", marcarVistos);

const jsonNvoChat = {
  notification: {
    title: "Nuevo mensaje",
    body: "Recibió un mensaje nuevo.",
  },
  android: {
    ttl: 3600 * 1000, // 1 hour in milliseconds
    priority: "high",
    notification: {
      title: "Nuevo mensaje",
      body: "Recibió un mensaje nuevo.",
      color: "#228B22",
      sound: "default",
      tag: "chat",
    },
  },
};

async function postBase(req, res) {
  req.body.cuenta = req.cuenta;
  try {
    const nuevoDoc = await comun.create(req.body);
    if (nuevoDoc.receptor && nuevoDoc.modelo === "usuario") {
      const receptor = await empleado.findOne({ _id: nuevoDoc.receptor }).lean();
      if (receptor.device) {
        const temp = assign(cloneDeep(jsonNvoChat), { token: receptor.device.token });
        enviarPush(temp);
      }
    }
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
    const msjs = await getMensajes({
      borrado: false,
      receptor: { $exists: false },
      cuenta: req.cuenta,
    }, req.query);
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

function marcarVistos(req, res) {
  const query = {
    emisor: req.params.emisor,
    receptor: req.usuario,
    visto: false,
  };
  return mensaje
    .update(query, { visto: true }, { multi: true })
    .then(ok(res))
    .catch(error(res));
}

export default router;
