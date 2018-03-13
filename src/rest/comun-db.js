import _ from "lodash";
import D from "debug";

const debug = D("ciris:commons/db.js");


export { Comunes, skipLimitABS };

function Comunes(modelo) {
  this.modelo = modelo;
}

Comunes.prototype.findOne = findOne;
Comunes.prototype.find = find;
Comunes.prototype.findOneAndUpdate = findOneAndUpdate;
Comunes.prototype.create = create;
Comunes.prototype.delete = deleteOne;
Comunes.prototype.efectuarCambio = efectuarCambio;

function find(pquery, pagination, populate) {
  debug("find");
  const este = this;
  const query = pquery || { borrado: false };
  const abs = skipLimitABS(pagination || {});
  return new Promise(((resolve, reject) => {
    const docs = este.modelo
      .find(query, { password: 0 })
      .skip(abs.total)
      .limit(abs.cantidad)
      .populate(populate || "")
      .lean();
    docs.exec((err, resp) => {
      debug("Ejecuté el query");
      if (err) {
        debug("Algo pasó", err);
        reject(err);
      }
      este.modelo.count(query, (err2, cant) => {
        debug("Contando objetos");
        if (err2) {
          debug("Algo pasó contando objetos", err2);
          reject(err2);
        }
        debug("Busqueda éxitosa");
        resolve({
          docs: resp,
          cant,
        });
      });
    });
  }));
}

function findOne(pid, pquery, populate) {
  const este = this;
  const query = pquery || { _id: pid, borrado: false };
  return new Promise(((resolve, reject) => {
    este.modelo.findOne(query, (err, obj) => {
      if (err) {
        reject(err);
      }
      if (_.isEmpty(obj)) {
        reject("No existe");
      }
      resolve(obj);
    }).lean()
      .populate(populate || "");
  }));
}

function findOneAndUpdate(pid, pbody, pquery, popciones) {
  const este = this;
  const query = pquery || { _id: pid, borrado: false };
  const opciones = popciones || {
    multi: false, upsert: false, new: true, runValidators: true,
  };
  return new Promise(((resolve, reject) => {
    este.modelo.findOneAndUpdate(query, pbody, opciones)
      .lean()
      .exec((err, obj) => {
        if (err) {
          reject(err);
        }
        if (_.isEmpty(obj)) {
          reject("No existe");
        }
        resolve(obj);
      });
  }));
}

function create(body) {
  const este = this;
  return new Promise(((resolve, reject) => {
    este.modelo.create(body, (err, obj) => {
      if (err) {
        debug("Error creando");
        return reject(err);
      }
      debug("Objeto creando");
      return resolve(obj);
    });
  }));
}

function deleteOne(pid) {
  const este = this;
  const opciones = { multi: false, upsert: false };
  return new Promise(((resolve, reject) => {
    este.modelo.update({ _id: pid }, { $set: { borrado: true } }, opciones, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  }));
}

function efectuarCambio(pid, pcambio, popciones, pquery) {
  const este = this;
  const query = pid ? { _id: pid, borrado: false } : pquery;
  const opciones = popciones || {
    multi: false, upsert: false, new: true, runValidators: true,
  };
  return new Promise(((resolve, reject) => {
    este.modelo.findOneAndUpdate(query, pcambio, opciones)
      .lean()
      .exec((err, obj) => {
        if (err) {
          reject(err);
        }
        if (_.isEmpty(obj)) {
          reject("No existe");
        }
        resolve(obj);
      });
  }));
}

function skipLimitABS(query) {
  const cantidad = parseInt(query.cantidad || 0, 10);
  const total = parseInt(query.pagina || 0, 10) * cantidad;
  return {
    cantidad,
    total,
  };
}
