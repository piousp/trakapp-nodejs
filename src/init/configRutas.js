import emailPass from "../login/emailPass.js";
import usuario from "../rutas/usuario.js";

export default function configRutas(app, estaAutorizado) {
  app.use("/api/auth", emailPass);
  app.use("/api/usuario", estaAutorizado, usuario);
}
