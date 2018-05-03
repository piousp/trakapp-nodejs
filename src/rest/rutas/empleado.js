import express from "express";
import D from "debug";
import modelo from "../modelos/empleado.js";
import { getID, getBase, putID, deleteID, ok, error } from "./_base";
import funBD from "../comun-db.js";

const debug = D("ciris:rutas/empleado.js");

const router = express.Router();
getID(router, modelo);
getBase(router, modelo);
putID(router, modelo);
deleteID(router, modelo);

router.post("/", postBase);

function postBase(req, res) {
  debug("Post base");
  req.body.password = "movil123";
  req.body.cuenta = req.cuenta;
  funBD(modelo).create(req.body)
    .then(ok(res))
    .catch(error(res));
}

export default router;
