import express from "express";
import D from "debug";
import modelo from "../modelos/empleado.js";
import * as funBD from "./_base";


const debug = D("ciris:rutas/empleado.js");

const router = express.Router();

funBD.getID(router, modelo);
funBD.getBase(router, modelo);
funBD.putID(router, modelo);
funBD.deleteID(router, modelo);

router.post("/", postBase);

function postBase(req, res) {
  debug("Post base");
  req.body.password = "movil123";
  funBD(modelo).create(req.body)
    .then(funBD.ok(res))
    .catch(funBD.error(res));
}

export default router;
