use rastreador;
db.clientes.renameCollection("cuentas");
db.usuarios.update({}, { $rename: { cliente: "cuenta" } }, { multi: true });
db.tareas.update({}, { $rename: { cliente: "cuenta" } }, { multi: true });
db.empleados.update({}, { $rename: { cliente: "cuenta" } }, { multi: true });
db.mensajes.update({}, { $rename: { cliente: "cuenta" } }, { multi: true });
