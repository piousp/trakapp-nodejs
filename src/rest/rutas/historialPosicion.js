import express from "express";
import historialPosicion from "../modelos/historialPosicion.js";
import rutasGenericas from "./_base.js";

const router = rutasGenericas(express.Router(), historialPosicion);

export default router;
