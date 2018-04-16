import isEmpty from "lodash/isEmpty";
import D from "debug";
import funDB from "../comun-db.js";

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

function getID(router, modelo) {
  debug("getID");
  const comun = funDB(modelo);
  function getIDInterno(req, res) {
    comun.findOne(null, { _id: req.params.id, cliente: req.cliente })
      .then(ok(res))
      .catch(error(res));
  }
  router.get("/:id", getIDInterno);
  return router;
}

function getBase(router, modelo) {
  debug("getBase");
  const comun = funDB(modelo);
  function getBaseInterno(req, res) {
    req.query.cliente = req.cliente;
    comun.find(null, req.query)
      .then(ok(res))
      .catch(error(res));
  }
  router.get("/", getBaseInterno);
  return router;
}
function putID(router, modelo) {
  debug("putID");
  const comun = funDB(modelo);
  function putIDInterno(req, res) {
    const quer = { _id: req.params.id, cliente: req.cliente };
    comun.findOneAndUpdate(null, req.body, quer)
      .then(ok(res))
      .catch(error(res));
  }
  router.put("/:id", putIDInterno);
  return router;
}


function postBase(router, modelo) {
  debug("postBase");
  const comun = funDB(modelo);
  function postBaseInterno(req, res) {
    req.body.cliente = req.cliente;
    comun.create(req.body)
      .then(ok(res))
      .catch(error(res));
  }
  router.post("/", postBaseInterno);
  return router;
}

function deleteID(router, modelo) {
  debug("deleteID");
  const comun = funDB(modelo);
  function deleteIDInterno(req, res) {
    const quer = { _id: req.params.id, cliente: req.cliente };
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
    if (isEmpty(err)) {
      return res.status(200).send({});
    }
    return res.status(500).send(err);
  };
}
