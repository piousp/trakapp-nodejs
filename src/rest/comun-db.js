import isEmpty from "lodash/isEmpty";
import D from "debug";
import curry from "lodash/curry";
import { ErrorMongo } from "../util/errores";

const debug = D("ciris:rest/comun-db.js");

export default funDB;

export {
  count,
  find,
  findOne,
  findOneFat,
  findOneAndUpdate,
  create,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
  efectuarCambio,
  agregarCatch,
  procesarBusqueda,
  skipLimitABS,
};

function funDB(modelo) {
  const obj = {};
  obj.count = curry(count)(modelo);
  obj.find = curry(find, 2)(modelo);
  obj.findOne = curry(findOne, 2)(modelo);
  obj.findOneFat = curry(findOneFat, 2)(modelo);
  obj.findOneAndUpdate = curry(findOneAndUpdate, 3)(modelo);
  obj.create = curry(create)(modelo);
  obj.updateOne = curry(updateOne)(modelo);
  obj.updateMany = curry(updateMany)(modelo);
  obj.deleteOne = curry(deleteOne)(modelo);
  obj.deleteMany = curry(deleteMany)(modelo);
  obj.efectuarCambio = curry(efectuarCambio, 3)(modelo);
  return obj;
}

async function find(modelo, pquery, pagination, populate) {
  debug("Invocando find con los siguientes params:", pquery, pagination, populate);
  const query = pquery || { borrado: false };
  debug("Parseando paginación");
  const abs = skipLimitABS(pagination || {});
  debug("Creando objeto Query de mongoose");
  try {
    const docs = modelo
      .find(query, { password: 0 })
      .skip(abs.total)
      .limit(abs.cantidad)
      .populate(populate || "")
      .lean();
    const objetos = await docs.exec();
    const conteo = await modelo.count(query).exec();
    return {
      docs: objetos,
      cant: conteo,
    };
  } catch (err) {
    debug(err);
    throw new ErrorMongo(`mensajeError: ${err}`);
  }
}

function count(modelo, pquery) {
  debug("Invocando count con los siguientes params:", pquery);
  const query = pquery || { borrado: false };
  const doc = modelo.count(query);
  return agregarCatch(doc.exec());
}

function findOne(modelo, pid, pquery, populate) {
  debug("Invocando findOne con los siguientes params:", pid, pquery, populate);
  const query = pquery || { _id: pid, borrado: false };
  const doc = modelo
    .findOne(query)
    .populate(populate || "")
    .lean();
  return procesarBusqueda(doc.exec());
}

function findOneFat(modelo, pid, pquery, populate) {
  debug("Invocando findOne con los siguientes params:", pid, pquery, populate);
  const query = pquery || { _id: pid, borrado: false };
  const doc = modelo
    .findOne(query)
    .populate(populate || "");
  return procesarBusqueda(doc.exec());
}

function findOneAndUpdate(modelo, pid, pbody, pquery, popciones) {
  debug("Invocando findOneAndUpdate con los siguientes params:", pid, pbody, pquery, popciones);
  const query = pquery || { _id: pid, borrado: false };
  const opciones = popciones || {
    multi: false, upsert: false, new: true, runValidators: true,
  };
  const doc = modelo.findOneAndUpdate(query, pbody, opciones).lean();
  return procesarBusqueda(doc.exec());
}

async function create(modelo, body) {
  debug("Invocando create");
  return agregarCatch(modelo.create(body));
}

async function updateOne(modelo, pid, body) {
  debug("Invocando updateOne");
  const opciones = { multi: false, upsert: false };
  return agregarCatch(modelo.update({ _id: pid }, body, opciones));
}

async function updateMany(modelo, pquery, body) {
  debug("Invocando updateMany");
  const opciones = { multi: true, upsert: false };
  return agregarCatch(modelo.update(pquery, body, opciones));
}

async function deleteOne(modelo, query) {
  debug("Invocando deleteOne");
  const opciones = { multi: false, upsert: false };
  return agregarCatch(modelo.update(query, { $set: { borrado: true } }, opciones));
}

async function deleteMany(modelo, pquery) {
  debug("Invocando deleteMany");
  const opciones = { multi: true, upsert: false };
  return agregarCatch(modelo.update(pquery, { $set: { borrado: true } }, opciones));
}

async function efectuarCambio(modelo, pid, pcambio, popciones, pquery) {
  debug("Invocando efectuarCambio");
  const query = pid ? { _id: pid, borrado: false } : pquery;
  const opciones = popciones || {
    multi: false, upsert: false, new: true, runValidators: true,
  };
  const docs = modelo.findOneAndUpdate(query, pcambio, opciones).lean();
  return procesarBusqueda(docs.exec());
}

function skipLimitABS(query) {
  const cantidad = parseInt(query.cantidad || 0, 10);
  const total = parseInt(query.pagina || 0, 10) * cantidad;
  return {
    cantidad,
    total,
  };
}

async function agregarCatch(promesa) {
  try {
    return await promesa;
  } catch (err) {
    debug("Error procesando cmd mongo", err);
    throw new ErrorMongo(`mensajeError: ${err}`);
  }
}

async function procesarBusqueda(query) {
  debug("Procesando búsqueda de mongo");
  try {
    const resp = await query;
    if (isEmpty(resp)) {
      debug("Búsqueda vacía");
      return null;
    }
    return resp;
  } catch (err) {
    debug(err);
    throw new ErrorMongo(`mensajeError: ${err}`);
  }
}
