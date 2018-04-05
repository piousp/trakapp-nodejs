import express from "express";
import { empleado } from "../modelos/empleado.js";
import funDB from "../comun-db.js";
import { getID, getBase, ok, error } from "./_base";

export default (io) => {
  const router = express.Router();
  const comun = funDB(empleado);

  getID(router, empleado);
  getBase(router, empleado);
  router.put("/:id", putID);
  router.post("/", postBase);


  function putID(req, res) {
    comun.findOneAndUpdate(req.params.id, req.body)
      .then((obj) => {
        io.sockets.emit("actualizarPosicion", obj);
        return res.json(obj);
      })
      .catch(error(res));
  }

  function postBase(req, res) {
    req.body.password = "movil123";
    comun.create(req.body)
      .then(ok(res))
      .catch(error(res));
  }
  return router;
};
