import D from "debug";
import servidor from "./init/express.js";
// import { estaAutorizado } from "./rest/login/middleware.js";
import emailPass from "./rest/login/emailPass.js";

const debug = D("ciris:index.js");

servidor((app) => {
  debug("Inicializando las rutas");
  app.use("/api/auth", emailPass);

  return app;
});
