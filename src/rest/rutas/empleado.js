import express from "express";
import D from "debug";
import modelo from "../modelos/empleado.js";
import { getID, getBase, putID, deleteID, error } from "./_base";
import funBD from "../comun-db.js";
import enviarCorreo from "../../util/correos";

const debug = D("ciris:rutas/empleado.js");

const router = express.Router();
getID(router, modelo);
getBase(router, modelo);
putID(router, modelo);
deleteID(router, modelo);

router.post("/", postBase);

function postBase(req, res) {
  debug("Post base");
  req.body.password = generarPassword(5);
  req.body.cuenta = req.cuenta;
  funBD(modelo).create(req.body)
    .then((obj) => {
      res.json(obj);
      return enviarCorreo({
        to: req.body.correo,
        subject: "Credenciales de Trakapp",
        html: `
          <div>
            <h1>Hola, ${req.body.nombre}</h1>
            <p>Su cuenta ha sido creada exitosamente y ya puede ingresar a ella con los siguientes credenciales:</p>
            <table>
              <tbody>
                <tr>
                  <td><strong>Correo:</strong></td>
                  <td>${req.body.correo}</td>
                </tr>
                <tr>
                  <td><strong>Contraseña:</strong></td>
                  <td>${req.body.password}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `,
      });
    })
    .catch(error(res));
}

function generarPassword(cant) {
  return Array(cant)
    .fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
    .map(arr => arr[Math.floor(Math.random() * arr.length)]).join("");
}

export default router;
