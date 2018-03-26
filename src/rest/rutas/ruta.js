import express from "express";
import isEmpty from "lodash/isEmpty";
import { modelo } from "../modelos/modelo.js";
import { Comunes as Comun } from "../comun-db.js";

const router = express.Router();
const comun = new Comun(modelo);

router.get("/:id", getID);
router.get("/", getBase);
router.put("/:id", putID);
router.post("/", postBase);

// Construya en promesas, y separe las funciones que usan el req y el res de las demas
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
  comun.create(req.body)
    .then(ok(res))
    .catch(error(res));
}

// Usualmente, todo deberia usar el findOne de comun...
// pero si necesita modificarlo o devolver el objeto con algun tipo de populate,
// puede implementar un findOne especifico por modelo (dentro de la ruta del modelo).
// Esto aplica para cualquier otro metodo, use los de comun,
// si ocupa funcionalidad extra, programela aqui
/* function findOne( pid ) {
  return new Promise( function( resolve, reject ) {
    modelo.findOne( {"_id": pid, "borrado": false}, function( err, obj ) {
      if ( err ) {
        reject( err );
      }
      if ( _.isEmpty( obj ) ) {
        reject( {} );
      }
      resolve( obj );
    } ).populate( "organizador" )
    .populate( "participantes solicitudes invitaciones",
     "_id nombre apellido user rank unrank icono" )
    .lean();
  } );
} */

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
