import express from "express";
import moment from "moment";
import D from "debug";
import modTareas from "../modelos/tarea.js";
import funDB from "../comun-db.js";
import { ok, error } from "./_base.js";

const comunTareas = funDB(modTareas);
const router = express.Router();
const debug = D("ciris:rest/rutas/reporte.js");

router.get("/getTareasRealizadas/", getTareasRealizadas);
router.get("/getTareasPendientes/", getTareasPendientes);
router.get("/getTareasAtrasadas/", getTareasAtrasadas);

export default router;

async function getTareasRealizadas(req, res) {
  debug("getTareasRealizadas");
  try {
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
    if (filtros.empleado) {
      query.empleado = filtros.empleado;
    }
    const tareas = await comunTareas.find(query, null, "empleado");
    ok(res)(tareas);
  } catch (e) {
    error(res)(e);
  }
}

async function getTareasPendientes(req, res) {
  debug("getTareasPendientes");
  try {
    const filtros = JSON.parse(req.query.filtros);
    const query = {
      start: { $gte: filtros.inicio },
      end: { $lte: filtros.fin },
      cuenta: req.cuenta,
      horaFin: { $exists: false },
      activa: true,
      borrado: false,
    };
    if (filtros.empleado) {
      query.empleado = filtros.empleado;
    }
    const tareas = await comunTareas.find(query, null, "empleado");
    ok(res)(tareas);
  } catch (e) {
    error(res)(e);
  }
}

async function getTareasAtrasadas(req, res) {
  debug("getTareasAtrasadas");
  try {
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
    if (filtros.empleado) {
      query.empleado = filtros.empleado;
    }
    const tareas = await comunTareas.find(query, null, "empleado");
    ok(res)(tareas);
  } catch (e) {
    error(res)(e);
  }
}
