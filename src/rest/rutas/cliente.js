import express from "express";
import cliente from "../modelos/cliente.js";
import rutasGenericas from "./_base.js";

const router = rutasGenericas(express.Router(), cliente);

export default router;
