import isEmpty from "lodash/isEmpty";
import funDB from "../comun-db.js";

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
  const comun = funDB(modelo);
  function getIDInterno(req, res) {
    comun.findOne(req.params.id)
      .then(ok(res))
      .catch(error(res));
  }
  router.get("/:id", getIDInterno);
  return router;
}

function getBase(router, modelo) {
  const comun = funDB(modelo);
  function getBaseInterno(req, res) {
    comun.find(null, req.query)
      .then(ok(res))
      .catch(error(res));
  }
  router.get("/", getBaseInterno);
  return router;
}
function putID(router, modelo) {
  const comun = funDB(modelo);
  function putIDInterno(req, res) {
    comun.findOneAndUpdate(req.params.id, req.body)
      .then(ok(res))
      .catch(error(res));
  }
  router.put("/:id", putIDInterno);
  return router;
}


function postBase(router, modelo) {
  const comun = funDB(modelo);
  function postBaseInterno(req, res) {
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
    comun.delete(req.params.id)
      .then(ok(res))
      .catch(error(res));
  }
  router.delete("/:id", deleteIDInterno);
  return router;
}


function rutasGenericas(router, modelo) {
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
