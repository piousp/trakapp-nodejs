import D from "debug";
import servidor from "./init/express.js";
// import { estaAutorizado } from "./rest/login/middleware.js";
import emailPass from "./rest/login/emailPass.js";

import { modelo } from "./rest/modelos/usuario.js";
import { Comunes } from "./rest/comun-db.js";

const comun = new Comunes(modelo);

const debug = D("ciris:index.js");

servidor((app) => {
  debug("Inicializando las rutas");
  app.use("/api/auth", emailPass);

  revisarPorRoot();

  return app;
});

function revisarPorRoot() {
  debug("Revisando por Root...");
  comun.findOne(null, { correo: "root" }).then(
    () => debug("Root encontrado!"),
    () => {
      debug("Root no encontrado, creando...");
      const usuarioRoot = {
        correo: "root",
        password: "cirisCiris.93",
        nombre: "root",
      };
      return comun.create(usuarioRoot).then(() => {
        debug("Root creado!");
      });
    },
  );
}
