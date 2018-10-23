import { render } from "mustache";
import { readFileSync } from "fs";
import { resolve } from "path";
import D from "debug";

const debug = D("ciris:util/renderizarHtml.js");

export default renderizar;

function renderizar(file, data) {
  debug("renderizar");
  const ruta = resolve(__dirname, `./plantillas/${file}`);
  const tpl = readFileSync(ruta, "utf8");
  return render(tpl, data);
}
