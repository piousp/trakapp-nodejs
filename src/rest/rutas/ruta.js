import express from "express";
import ruta from "../modelos/ruta.js";
import rutasGenericas from "./_base.js";

const router = rutasGenericas(express.Router(), ruta);

export default router;
