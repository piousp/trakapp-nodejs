import D from "debug";
import express from "express";
import moment from "moment";
import cloneDeep from "lodash/cloneDeep";
import assign from "lodash/assign";
import tarea from "../modelos/tarea.js";
import empleado from "../modelos/empleado.js";
import funDB from "../comun-db.js";
import { enviarPush } from "../../util/pushNotifications";
import { getID, getBase, putID, deleteID, ok, error } from "./_base";

const debug = D("ciris:rutas/tarea.js");
const router = express.Router();
const comun = funDB(tarea);

router.get("/empleado/:id", getTareasEmpleado);
router.get("/listaPopulada", listarTareasPopuladas);
router.get("/listarXFecha", listarXFecha);
getID(router, tarea, "cuenta");
getBase(router, tarea);
router.put("/completar/:id", completar);
router.put("/iniciar/:id", iniciar);
putID(router, tarea);
router.post("/", postTarea);
deleteID(router, tarea);

export default router;

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

async function listarTareasPopuladas(req, res) {
  debug("listarTareasPopuladas");
  try {
    const query = { cuenta: req.cuenta, borrado: false };
    const docs = await comun.find(query, req.query, "cliente empleado");
    return ok(res)(docs);
  } catch (e) {
    return error(res)(e);
  }
}

async function postTarea(req, res) {
  debug("postTarea");
  try {
    req.body.cuenta = req.cuenta;
    const objTarea = await comun.create(req.body);
    const objEmpleado = await empleado.findOne({ _id: objTarea.empleado }).lean();
    if (objEmpleado.device && objEmpleado.device.token && objEmpleado.device.platform) {
      const temp = assign(cloneDeep(jsonNvaTarea), { token: objEmpleado.device.token });
      enviarPush(temp);
    }
    return ok(res)(objTarea);
  } catch (e) {
    return error(res)(e);
  }
}

async function getTareasEmpleado(req, res) {
  debug("getTareasEmpleado");
  try {
    const query = {
      borrado: false,
      cuenta: req.cuenta,
      activa: true,
      empleado: req.params.id,
    };
    const tareas = await comun.find(query);
    return ok(res)(tareas);
  } catch (e) {
    return error(res)(e);
  }
}


async function listarXFecha(req, res) {
  debug("listarXFecha");
  try {
    const query = {
      borrado: false,
      cuenta: req.cuenta,
      start: {
        $gte: req.query.fechaInicio,
        $lte: req.query.fechaFin,
      },
    };
    const tareas = await comun.find(query, null, "cliente");
    return ok(res)(tareas);
  } catch (e) {
    return error(res)(e);
  }
}

async function completar(req, res) {
  debug("completar");
  try {
    const tareatemp = req.body;
    const tareaPopulada = await tarea
      .findOne({ _id: tareatemp._id }, { title: 1, empleado: 1, cuenta: 1 })
      .populate("empleado");
    req.socketIO.to(tareaPopulada.cuenta).emit("notificarTarea", {
      title: tareaPopulada.title,
      empleado: {
        nombre: tareaPopulada.empleado.nombre,
        apellidos: tareaPopulada.empleado.apellidos,
      },
    });
    const tareaCambiada = await comun.efectuarCambio(
      req.params.id,
      { $set: { activa: false, horaFin: moment(), post: tareatemp.post } },
    );
    return ok(res)(tareaCambiada);
  } catch (e) {
    return error(res)(e);
  }
}

async function iniciar(req, res) {
  debug("iniciar");
  try {
    const tareaCambiada =
    await comun.efectuarCambio(req.params.id, { $set: { horaInicio: moment() } });
    return ok(res)(tareaCambiada);
  } catch (e) {
    return error(res)(e);
  }
}
