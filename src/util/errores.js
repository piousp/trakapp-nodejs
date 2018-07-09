export { ErrorMongo, UsuarioInvalido };


function ErrorMongo(message, code) {
  this.name = "ErrorMongo";
  this.code = code;
  this.message = message || "Hubo un problema en Mongo";
  this.stack = (new Error(code)).stack;
}
ErrorMongo.prototype = Object.create(Error.prototype);
ErrorMongo.prototype.constructor = ErrorMongo;

/** ******************************************************************************** */
function UsuarioInvalido(message) {
  this.name = "UsuarioInvalido";
  this.message = message || "Usuario inválido";
  this.stack = (new Error()).stack;
}
UsuarioInvalido.prototype = Object.create(Error.prototype);
UsuarioInvalido.prototype.constructor = UsuarioInvalido;
