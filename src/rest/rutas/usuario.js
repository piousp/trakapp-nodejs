import express from "express";
import usuario from "../modelos/usuario.js";
import rutasGenericas from "./_base.js";

const router = rutasGenericas(express.Router(), usuario);

export default router;
