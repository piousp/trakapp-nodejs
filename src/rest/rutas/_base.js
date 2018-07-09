import isEmpty from "lodash/isEmpty";
import D from "debug";
import funDB from "../comun-db.js";
import bugsnag from "../../init/bugsnag";

const debug = D("ciris:rest/rutas/_base.js");

export default rutasGenericas;
export {
  getID,
  getBase,
  putID,
  postBase,
  deleteID,
  ok,
  error,
};

function getID(router, modelo, populate) {
  const comun = funDB(modelo);
  function getIDInterno(req, res) {
    debug("getID");
    comun.findOne(null, { _id: req.params.id, cuenta: req.cuenta, borrado: false }, populate)
      .then(ok(res))
      .catch(error(res));
  }
  router.get("/:id", getIDInterno);
  return router;
}

function getBase(router, modelo) {
  const comun = funDB(modelo);
  function getBaseInterno(req, res) {
    debug("getBase");
    comun.find({ cuenta: req.cuenta, borrado: false }, req.query)
      .then(ok(res))
      .catch(error(res));
  }
  router.get("/", getBaseInterno);
  return router;
}
function putID(router, modelo) {
  const comun = funDB(modelo);
  function putIDInterno(req, res) {
    debug("putID", req.body);
    const quer = { _id: req.params.id, cuenta: req.cuenta, borrado: false };
    comun.findOneAndUpdate(null, req.body, quer)
      .then(ok(res))
      .catch(error(res));
  }
  router.put("/:id", putIDInterno);
  return router;
}


function postBase(router, modelo) {
  const comun = funDB(modelo);
  function postBaseInterno(req, res) {
    debug("postBase");
    req.body.cuenta = req.cuenta;
    comun.create(req.body)
      .then(ok(res))
      .catch(error(res));
  }
  router.post("/", postBaseInterno);
  return router;
}

function deleteID(router, modelo) {
  const comun = funDB(modelo);
  function deleteIDInterno(req, res) {
    debug("deleteID");
    const quer = { _id: req.params.id, cuenta: req.cuenta, borrado: false };
    comun.deleteOne(quer)
      .then(ok(res))
      .catch(error(res));
  }
  router.delete("/:id", deleteIDInterno);
  return router;
}


function rutasGenericas(router, modelo) {
  debug("Registrando todas las rutas genéricas");
  const rtg = getID(router, modelo);
  const rtbase = getBase(rtg, modelo);
  const rtput = putID(rtbase, modelo);
  const rtpost = postBase(rtput, modelo);
  const rtdelete = deleteID(rtpost, modelo);
  return rtdelete;
}

function ok(res) {
  return (obj) => {
    if (obj) {
      delete obj.password;
    }
    return res.json(obj);
  };
}

function error(res) {
  return (err) => {
    bugsnag.notify(new Error(err));
    if (isEmpty(err)) {
      return res.status(200).send({});
    }
    switch (err.code) {
      case 11000: return res.status(409).send(err.message);
      default: return res.status(500).send(err.message);
    }
  };
}
