import { render } from "mustache";
import { readFileSync } from "fs";
import { resolve } from "path";

function renderizar(file, data) {
  const ruta = resolve(__dirname, `./plantillas/${file}`);
  const tpl = readFileSync(ruta, "utf8");
  return render(tpl, data);
}

export default renderizar;
