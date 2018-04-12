import express from "express";
import isEmpty from "lodash/isEmpty";
import { empleado } from "../modelos/empleado.js";
import { Comunes as Comun } from "../comun-db.js";

const router = express.Router();
const comun = new Comun(empleado);

router.get("/:id", getID);
router.get("/", getBase);
router.put("/:id", putID);
router.post("/", postBase);

function getID(req, res) {
  comun.findOne(req.params.id)
    .then(ok(res))
    .catch(error(res));
}

function getBase(req, res) {
  comun.find()
    .then(ok(res))
    .catch(error(res));
}

function putID(req, res) {
  comun.findOneAndUpdate(req.params.id, req.body)
    .then(ok(res))
    .catch(error(res));
}

function postBase(req, res) {
  req.body.password = "movil123";
  comun.create(req.body)
    .then(ok(res))
    .catch(error(res));
}

function ok(res) {
  return obj => res.json(obj);
}

function error(res) {
  return (err) => {
    if (isEmpty(err)) {
      return res.status(200).send({});
    }
    return res.status(500).send(err);
  };
}

export default router;
