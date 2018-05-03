import express from "express";
import orderBy from "lodash/orderBy";
import D from "debug";
import mensaje from "../modelos/mensaje.js";
import funDB from "../comun-db.js";
import { postBase, error } from "./_base";

const debug = D("ciris:mensajes");
const router = express.Router();
const comun = funDB(mensaje);

router.get("/:receptor", getBase);
postBase(router, mensaje);

async function getBase(req, res) {
  const query = {
    borrado: false,
    emisor: {
      $in: [req.query.emisor, req.params.receptor],
    },
    receptor: {
      $in: [req.query.emisor, req.params.receptor],
    },
  };
  try {
    const msjs = await mensaje
      .find(query)
      .sort({ fechaEnvio: -1 })
      .skip(parseInt(req.query.cargados || 0, 10))
      .limit(parseInt(req.query.cantidad || 0, 10))
      .lean();
    const cant = await comun.count(query);
    debug("Imprimiendo cantidad", cant);
    const docs = orderBy(msjs, "fechaEnvio", "asc");
    return res.send({ docs, cant });
  } catch (e) {
    return error(res);
  }
}

export default router;
