import express from "express";
import modelo from "../modelos/modelo.js";
/**
 * Se pueden importar los métodos individuales, o todas las rutas de una vez.
 Si se importan las rutas individualmente, es porque las genéricas no le funcionan y se necesita un
 `postBase` especial, por ejemplo.

 Si todas las rutas genéricas (con bd) le funcionan, se puede hacer:


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 import rutasGenericas from "./_base.js";

 const router = rutasGenericas(express.Router(), modelo);
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


 */
import { getID, getBase, deleteID } from "./_base";

const router = express.Router();

getID(router, modelo);
getBase(router, modelo);
deleteID(router, modelo);


export default router;
