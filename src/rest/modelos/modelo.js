

// var bcrypt = require( "bcrypt" );
// var SALT_WORK_FACTOR = 10;

import mongoose from "mongoose";

const esquema = new mongoose.Schema({
// Aqui va toda la especificacion del esquema (modelo)
});

// Implementar indices
/* esquema.index( {
    codEntrada: 1
} );

//Esta es una implementacion base de BCrypt, para encriptar contraseñas
function encriptar( usuario, next ) {
  bcrypt.genSalt( SALT_WORK_FACTOR, function( err, salt ) {
    if ( err ) {
      return next( err );
    }
    bcrypt.hash( usuario.password, salt, function( err, hash ) {
      if ( err ) {
        return next( err );
      }
      usuario.password = hash;
      next();
    } );
  } );
}

esquema.pre( "save", function( next ) {
  var usuario = this;
  if ( !usuario.isModified( "password" ) ) {
    return next();
  }
  encriptar( usuario, next );
} );

esquema.methods.comparePassword = function( inputPassword, callback ) {
  bcrypt.compare( inputPassword, this.password, function( err, isMatch ) {
    if ( err ) {
      return callback( err );
    }
    callback( null, isMatch );
  } );
}; */

const modelo = mongoose.model("usuario", esquema);

export { esquema, modelo };
