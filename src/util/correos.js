import D from "debug";
import cloneDeep from "lodash/cloneDeep";
import assign from "lodash/assign";
import MG from "mailgun-js";
import entorno from "../entorno.js";

const debug = D("ciris:util/correos.js");

const apiKey = entorno.API_KEY;
const domain = entorno.DOMAIN;
const mailgun = MG({ apiKey, domain });

const tmpData = {
  from: `Trakapp <noreply@${entorno.DOMAIN}>`,
  to: "",
  subject: "",
};

async function enviarCorreo(pdata) {
  debug("Enviando correo");
  debug(pdata);
  const data = assign(cloneDeep(tmpData), pdata);
  return mailgun.messages().send(data).then(resp => resp).catch(err => debug(err));
}

export default enviarCorreo;
