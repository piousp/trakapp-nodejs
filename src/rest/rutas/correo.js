import express from "express";
import D from "debug";
import renderizarHtml from "../../util/renderizarHtml.js";
import enviarCorreo from "../../util/correos";
import entorno from "../../entorno.js";

const debug = D("ciris:rutas/correo.js");

const Router = express.Router();

Router.post("/", enviar); // Este envia a la lista recibida y manda el mensaje recibido tambien

async function enviar(req, res) {
  debug("Enviando correo libre");
  const html = renderizarHtml("plantillaGenerica.html", {
    admin_url: entorno.ADMIN_URL,
    asunto: req.body.asunto,
    mensaje: req.body.mensaje,
  });
  const data = {
    to: req.body.correos.join(", "),
    subject: req.body.asunto,
    html,
  };
  const resp = await enviarCorreo(data);
  debug(resp);
  return res.status(200).send("Se envió el correo libre");
}

export default Router;
