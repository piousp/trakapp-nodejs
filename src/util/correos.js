import D from "debug";
import cloneDeep from "lodash/cloneDeep";
import assign from "lodash/assign";
import entorno from "../entorno.js";

const debug = D("ciris:rest/login/emailPass.js");

const apiKey = entorno.API_KEY;
const domain = entorno.DOMAIN;
const mailgun = require("mailgun-js")({ apiKey, domain });

const tmpData = {
  from: `TrakApp <noreply@${entorno.DOMAIN}>`,
  to: "",
  subject: "",
};

function enviarCorreo(pdata) {
  debug("Enviando correo");
  debug(pdata);
  const data = assign(cloneDeep(tmpData), pdata);
  mailgun.messages().send(data, (error, body) => {
    debug(body);
  });
}

export default enviarCorreo;
