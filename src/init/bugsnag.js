import bugsnag from "bugsnag";
import pkgJson from "../../package.json";
import entorno from "../entorno";

const opts = {
  appVersion: pkgJson.version,
  packageJSON: pkgJson,
  hostname: entorno.ADMIN_URL,
  releaseStage: entorno.BUGSNAG_STAGE,
};
bugsnag.register("401610cde89bf3c4dbc8007078d4a975", opts);

export default bugsnag;
