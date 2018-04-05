import isEmpty from "lodash/isEmpty";
import pify from "pify";
import D from "debug";
import curry from "lodash/curry";
import { ErrorMongo, NoExiste } from "../util/errores";

const debug = D("ciris:rest/comun-db.js");

export default fundDB;

export {
  find,
  findOne,
  findOneAndUpdate,
  create,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
  efectuarCambio,
  procesar,
  procesarBusqueda,
};

function fundDB(modelo) {
  const obj = {};
  obj.find = curry(find)(modelo);
  obj.findOne = curry(findOne)(modelo);
  obj.findOneAndUpdate = curry(findOneAndUpdate)(modelo);
  obj.create = curry(create)(modelo);
  obj.updateOne = curry(updateOne)(modelo);
  obj.updateMany = curry(updateMany)(modelo);
  obj.deleteOne = curry(deleteOne)(modelo);
  obj.deleteMany = curry(deleteMany)(modelo);
  obj.efectuarCambio = curry(efectuarCambio)(modelo);
  return obj;
}

function find(modelo, pquery, pagination, populate) {
  debug("find");
  const query = pquery || { borrado: false };
  const abs = skipLimitABS(pagination || {});
  const docs = modelo
    .find(query, { password: 0 })
    .skip(abs.total)
    .limit(abs.cantidad)
    .populate(populate || "")
    .lean();
  const objetos = pify(docs.exec).then(procesar("Error en la búsqueda"));
  const conteo = pify(modelo.count)(query).then(procesar("Error en el conteo"));
  return Promise.all([objetos, conteo])
    .then(valores => ({
      docs: valores[0],
      cant: valores[1],
    }));
}

function findOne(modelo, pid, pquery, populate) {
  debug("Invocando findOne con los siguientes params:", pid, pquery, populate);
  const query = pquery || { _id: pid, borrado: false };
  const doc = modelo
    .findOne(query)
    .populate(populate || "")
    .lean();
  return procesarBusqueda(doc.exec);
}

function findOneAndUpdate(modelo, pid, pbody, pquery, popciones) {
  debug("Invocando findOneAndUpdate con los siguientes params:", pid, pbody, pquery, popciones);
  const query = pquery || { _id: pid, borrado: false };
  const opciones = popciones || {
    multi: false, upsert: false, new: true, runValidators: true,
  };
  const doc = modelo.findOneAndUpdate(query, pbody, opciones).lean();
  return procesarBusqueda(doc.exec);
}

function create(modelo, body) {
  debug("Invocando create");
  return pify(modelo.create)(body)
    .then(procesar("Error insertando el obj"));
}

function updateOne(modelo, pid, body) {
  debug("Invocando updateOne");
  const opciones = { multi: false, upsert: false };
  return pify(modelo.update)({ _id: pid }, body, opciones)
    .then(procesar("Error actualizando el obj"));
}

function updateMany(modelo, pquery, body) {
  debug("Invocando updateMany");
  const opciones = { multi: true, upsert: false };
  return pify(modelo.update)(pquery, body, opciones)
    .then(procesar("Error actualizando los obj"));
}

function deleteOne(modelo, pid) {
  debug("Invocando deleteOne");
  const opciones = { multi: false, upsert: false };
  return pify(modelo.update)({ _id: pid }, { $set: { borrado: true } }, opciones)
    .then(procesar("Error borrando lógicamente el obj"));
}

function deleteMany(modelo, pquery) {
  debug("Invocando deleteMany");
  const opciones = { multi: true, upsert: false };
  return pify(modelo.update)(pquery, { $set: { borrado: true } }, opciones)
    .then(procesar("Error borrando lógicamente los obj"));
}

function efectuarCambio(modelo, conteo, pid, pcambio, popciones, pquery) {
  debug("Invocando efectuarCambio");
  const query = pid ? { _id: pid, borrado: false } : pquery;
  const opciones = popciones || {
    multi: false, upsert: false, new: true, runValidators: true,
  };
  const docs = modelo.findOneAndUpdate(query, pcambio, opciones).lean();
  return procesarBusqueda(docs.exec);
}

function skipLimitABS(query) {
  const cantidad = parseInt(query.cantidad || 0, 10);
  const total = parseInt(query.pagina || 0, 10) * cantidad;
  return {
    cantidad,
    total,
  };
}

function procesar(mensajeError) {
  debug("Procesando solicitud de mongo");
  return (err, resp) => {
    debug("Resultados:" err, resp);
    if (err) {
      debug(mensajeError, err);
      throw new ErrorMongo(`mensajeError: ${err}`);
    }
    return resp;
  };
}

function procesarBusqueda(query) {
  debug("Procesando búsqueda de mongo");
  return pify(query)()
    .then(procesar("Error en la búsqueda"))
    .then((resp) => {
      if (isEmpty(resp)) {
        throw new NoExiste();
      }
      return resp;
    });
}
