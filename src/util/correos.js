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

export default enviarCorreo;

async function enviarCorreo(pdata) {
  debug("Enviando correo");
  debug(pdata);
  const data = assign(cloneDeep(tmpData), pdata);
  try {
    return mailgun.messages().send(data);
  } catch (err) {
    debug(err);
    return err;
  }
}
