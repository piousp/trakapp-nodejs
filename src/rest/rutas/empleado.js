import express from "express";
import _ from "lodash";
import { empleado } from "../modelos/empleado.js";
import { Comunes as Comun } from "../comun-db.js";

export default (io) => {
  const router = express.Router();
  const comun = new Comun(empleado);

  router.get("/:id", getID);
  router.get("/", getBase);
  router.put("/:id", putID);
  router.post("/", postBase);

  function getID(req, res) {
    comun.findOne(req.params.id).then(ok(res), error(res));
  }

  function getBase(req, res) {
    comun.find().then(ok(res), error(res));
  }

  function putID(req, res) {
    comun.findOneAndUpdate(req.params.id, req.body)
      .then((obj) => {
        console.log(io.sockets);
        io.sockets.emit("actualizarPosicion", obj);
        return res.json(obj);
      }, error(res));
  }

  function postBase(req, res) {
    comun.create(req.body).then(ok(res), error(res));
  }

  function ok(res) {
    return obj => res.json(obj);
  }

  function error(res) {
    return (err) => {
      if (_.isEmpty(err)) {
        return res.status(200).send({});
      }
      return res.status(500).send(err);
    };
  }
  return router;
};
