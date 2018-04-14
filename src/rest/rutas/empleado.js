import express from "express";
import D from "debug";
import empleado from "../modelos/empleado.js";
import funDB from "../comun-db.js";
import { getID, deleteID, error } from "./_base";

const debug = D("ciris:rutas/empleado.js");

export default (io) => {
  const router = express.Router();
  const comun = funDB(empleado);

  getID(router, empleado);

  deleteID(router, empleado);
  router.get("/", getLista);
  router.put("/:id", putID);
  router.post("/", postBase);

  async function getLista(req, res) {
    debug("Listando empleados para el cliente", req.usuario);
    const query = { cliente: req.usuario, borrado: false };
    const empleados = await comun.find(query, req.query);
    res.send(empleados);
  }


  function putID(req, res) {
    comun.findOneAndUpdate(req.params.id, req.body)
      .then((obj) => {
        io.sockets.emit("actualizarPosicion", obj);
        return res.json(obj);
      })
      .catch(error(res));
  }

  async function postBase(req, res) {
    debug("Creando un empleado para el cliente", req.usuario);
    req.body.password = "movil123";
    req.body.cliente = req.usuario;
    const resBd = await comun.create(req.body);
    res.send(resBd);
  }
  return router;
};
