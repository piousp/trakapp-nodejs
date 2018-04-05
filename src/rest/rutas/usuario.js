import express from "express";
import { modelo } from "../modelos/usuario.js";
import rutasGenericas from "./_base.js";

const router = rutasGenericas(express.Router(), modelo);

export default router;
