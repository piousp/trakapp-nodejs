import express from "express";
import { tarea } from "../modelos/tarea.js";
import funDB from "../comun-db.js";
import { getID, putID, postBase, deleteID, ok, error } from "./_base";

const router = express.Router();
const comun = funDB(tarea);

router.get("/empleado/:id", getTareasEmpleado);
getID(router, tarea);
router.get("/", getBase);
putID(router, tarea);
postBase(router, tarea);
deleteID(router, tarea);

function getTareasEmpleado(req, res) {
  const query = {
    borrado: false,
    empleado: req.params.id,
  };
  comun.find(query)
    .then(ok(res))
    .catch(error(res));
}


function getBase(req, res) {
  const query = {
    borrado: false,
    start: {
      $gte: req.query.fechaInicio,
      $lte: req.query.fechaFin,
    },
  };
  comun.find(query)
    .then(ok(res))
    .catch(error(res));
}

export default router;
