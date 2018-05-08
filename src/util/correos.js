import D from "debug";
import cloneDeep from "lodash/cloneDeep";
import assign from "lodash/assign";
import MG from "mailgun-js";
import util from "util";
import entorno from "../entorno.js";

const debug = D("ciris:rest/login/emailPass.js");

const apiKey = entorno.API_KEY;
const domain = entorno.DOMAIN;
const mailgun = MG({ apiKey, domain });

const tmpData = {
  from: `TrakApp <noreply@${entorno.DOMAIN}>`,
  to: "",
  subject: "",
};

async function enviarCorreo(pdata) {
  debug("Enviando correo");
  debug(pdata);
  const data = assign(cloneDeep(tmpData), pdata);
  const mgp = util.promisify(mailgun.messages().send);
  const resp = await mgp(data);
  return resp;
}

export default enviarCorreo;
