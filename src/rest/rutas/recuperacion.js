import express from "express";
import recuperacion from "../modelos/recuperacion.js";
import rutasGenericas from "./_base.js";

const router = rutasGenericas(express.Router(), recuperacion);

export default router;
