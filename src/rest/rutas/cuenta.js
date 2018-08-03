import express from "express";
import D from "debug";
import cuenta from "../modelos/cuenta.js";
import rutasGenericas from "./_base.js";
import enviarCorreo from "../../util/correos";
import renderizarHtml from "../../util/renderizarHtml.js";
import entorno from "../../entorno.js";

const debug = D("ciris:rutas/cuenta.js");

const Router = express.Router();

const router = rutasGenericas(Router, cuenta);
Router.post("/invitarUsuarios", invitarUsuarios);

async function invitarUsuarios(req, res) {
  try {
    const html = renderizarHtml("invitacionUnirse.html", {
      url_invitacion: `${entorno.ADMIN_URL}/invitacion/${req.body.usuario.cuenta._id}`,
      nombre_usuario: req.body.usuario.nombre,
      cuenta_nombre: req.body.usuario.cuenta.nombre,
    });
    const data = {
      to: req.body.correos.join(", "),
      subject: `¡${req.body.usuario.nombre} le ha invitado a Trakapp!`,
      html,
    };
    const resp = await enviarCorreo(data);
    debug(resp);
    return res.status(200).send("Se envió el correo invitando a los usuarios");
  } catch (err) {
    debug(err);
    return res.status(500).send(err.message);
  }
}


export default router;
