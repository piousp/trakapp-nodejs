import D from "debug";
import express from "express";
import moment from "moment";
import cloneDeep from "lodash/cloneDeep";
import assign from "lodash/assign";
import tarea from "../modelos/tarea.js";
import empleado from "../modelos/empleado.js";
import funDB from "../comun-db.js";
import { enviarPush } from "../../util/pushNotifications";
import { getID, putID, deleteID, ok, error } from "./_base";

const debug = D("ciris:rutas/tarea.js");
const router = express.Router();
const comun = funDB(tarea);

router.get("/empleado/:id", getTareasEmpleado);
getID(router, tarea, "cuenta");
router.get("/", getBase);
router.put("/completar/:id", completar);
router.put("/iniciar/:id", iniciar);
putID(router, tarea);
router.post("/", postTarea);
deleteID(router, tarea);

const jsonNvaTarea = {
  notification: {
    title: "Nueva tarea",
    body: "Se le asignó una nueva tarea.",
  },
  android: {
    ttl: 3600 * 1000, // 1 hour in milliseconds
    priority: "high",
    notification: {
      title: "Nueva tarea",
      body: "Se le asignó una nueva tarea.",
      color: "#228B22",
      sound: "default",
      tag: "tarea",
    },
    data: {
      tipo: "tarea",
    },
  },
};

async function postTarea(req, res) {
  debug("postTarea");
  req.body.cuenta = req.cuenta;
  try {
    const objTarea = await comun.create(req.body);
    const objEmpleado = await empleado.findOne({ _id: objTarea.empleado }).lean();
    if (objEmpleado.device && objEmpleado.device.token && objEmpleado.device.platform) {
      const temp = assign(cloneDeep(jsonNvaTarea), { token: objEmpleado.device.token });
      enviarPush(temp);
    }
    return res.json(objTarea);
  } catch (e) {
    return error(e);
  }
}

function getTareasEmpleado(req, res) {
  const query = {
    borrado: false,
    cuenta: req.cuenta,
    activa: true,
    empleado: req.params.id,
  };
  comun.find(query)
    .then(ok(res))
    .catch(error(res));
}


function getBase(req, res) {
  const query = {
    borrado: false,
    cuenta: req.cuenta,
    start: {
      $gte: req.query.fechaInicio,
      $lte: req.query.fechaFin,
    },
  };
  comun.find(query)
    .then(ok(res))
    .catch(error(res));
}

function completar(req, res) {
  comun.efectuarCambio(req.params.id, { $set: { activa: false, horaFin: moment() } })
    .then(ok(res))
    .catch(error(res));
}

function iniciar(req, res) {
  comun.efectuarCambio(req.params.id, { $set: { horaInicio: moment() } })
    .then(ok(res))
    .catch(error(res));
}

export default router;
