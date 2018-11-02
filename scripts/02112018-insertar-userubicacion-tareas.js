use trakapp;
db.tareas.update({ usarUbicacion: { $exists: false } }, { $set: { usarUbicacion: true } }, { multi: true });
