import express from "express";
import _ from "lodash";
import { mensaje } from "../modelos/mensaje.js";
import { Comunes as Comun } from "../comun-db.js";

const router = express.Router();
const comun = new Comun(mensaje);

router.get("/:receptor", getBase);
router.post("/", postBase);

function getBase(req, res) {
  const query = {
    borrado: false,
    emisor: {
      $in: [req.query.emisor, req.params.receptor],
    },
    receptor: {
      $in: [req.query.emisor, req.params.receptor],
    },
  };
  comun.find(query).then(ok(res), error(res));
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

export default router;
