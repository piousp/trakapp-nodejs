import servidor from "./init/express.js";
import emailPass from "./login/emailPass.js";
import usuario from "./rutas/usuario.js";

servidor((app, estaAutorizado) => {
  app.use("/api/auth", emailPass);
  app.use("/api/usuario", estaAutorizado, usuario);
  return app;
});
