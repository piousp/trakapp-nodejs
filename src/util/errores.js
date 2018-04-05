export { ErrorMongo, NoExiste };


function ErrorMongo(message) {
  this.name = "ErrorMongo";
  this.message = message || "Hubo un problema en Mongo";
  this.stack = (new Error()).stack;
}
ErrorMongo.prototype = Object.create(Error.prototype);
ErrorMongo.prototype.constructor = ErrorMongo;

/** ******************************************************************************** */
function NoExiste(message) {
  this.name = "NoExiste";
  this.message = message || "El documento solicitado no existe";
  this.stack = (new Error()).stack;
}
NoExiste.prototype = Object.create(Error.prototype);
NoExiste.prototype.constructor = NoExiste;

/** ******************************************************************************** */
function UsuarioInvalido(message) {
  this.name = "UsuarioInvalido";
  this.message = message || "Usuario inválido";
  this.stack = (new Error()).stack;
}
UsuarioInvalido.prototype = Object.create(Error.prototype);
UsuarioInvalido.prototype.constructor = UsuarioInvalido;
