import express from "express";
import mensaje from "../modelos/mensaje.js";
import funDB from "../comun-db.js";
import { postBase, ok, error } from "./_base";

const router = express.Router();
const comun = funDB(mensaje);

router.get("/:receptor", getBase);
postBase(router, mensaje);

function getBase(req, res) {
  const query = {
    borrado: false,
    emisor: {
      $in: [req.query.emisor, req.params.receptor],
    },
    receptor: {
      $in: [req.query.emisor, req.params.receptor],
    },
  };
  comun.find(query)
    .then(ok(res))
    .catch(error(res));
}


export default router;
