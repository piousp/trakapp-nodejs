import express from "express";
import moment from "moment";
import modTareas from "../modelos/tarea.js";
import funDB from "../comun-db.js";
import { ok, error } from "./_base.js";

const comunTareas = funDB(modTareas);
const router = express.Router();

router.get("/getTareasRealizadas/", getTareasRealizadas);
router.get("/getTareasPendientes/", getTareasPendientes);
router.get("/getTareasAtrasadas/", getTareasAtrasadas);

function getTareasRealizadas(req, res) {
  const filtros = JSON.parse(req.query.filtros);
  const query = {
    start: { $gte: filtros.inicio },
    end: { $lte: filtros.fin },
    cuenta: req.cuenta,
    horaInicio: { $exists: true },
    horaFin: { $exists: true },
    activa: false,
    borrado: false,
  };
  comunTareas.find(query, null, "empleado")
    .then(ok(res))
    .catch(error(res));
}

function getTareasPendientes(req, res) {
  const filtros = JSON.parse(req.query.filtros);
  const query = {
    start: { $gte: filtros.inicio },
    end: { $lte: filtros.fin },
    cuenta: req.cuenta,
    horaFin: { $exists: false },
    activa: true,
    borrado: false,
  };
  comunTareas.find(query, null, "empleado")
    .then(ok(res))
    .catch(error(res));
}

function getTareasAtrasadas(req, res) {
  const fechaActual = moment().format();
  const filtros = JSON.parse(req.query.filtros);
  const query = {
    start: { $gte: filtros.inicio },
    $and: [
      { end: { $lte: filtros.fin } },
      { end: { $lt: fechaActual } },
    ],
    cuenta: req.cuenta,
    activa: true,
    borrado: false,
  };
  comunTareas.find(query, null, "empleado")
    .then(ok(res))
    .catch(error(res));
}

export default router;
