# Proyecto Base - Backend
Ahora se usa ES6 (Ecmascript 2015). Referencias: (http://es6-features.org/)[http://es6-features.org/#Constants]

## Versiones e instalación
- Node: 8.9.4
- NPM: 5.6.0

``` bash
npm install
```
## Variables de entorno
 - MONGO_URI: URI de la base de datos. Por defecto `mongodb://localhost:29531/base`
 - PUERTO: Puerto en el que corre la aplicación. Por defecto `3001`
 - ORIGIN: Orígenes aceptados para el CORS. Por defecto `http://localhost:3000`
 - TOKEN_SECRET: Hash para encriptar el token

## Scripts de ejecución
### Lint
Verifica todos los archivos javascript dentro de `src` con las reglas definas en el linter.
``` bash
npm run lint
```

### Tests (Unidad)
Ejecuta todos los tests que se encuentren dentro de `src`. Los archivos debe tener un nombre que cumpla con el siguiente regex: `\w+\.spec\.js`, o humanamente: `xxxx.spec.js`
``` bash
npm run test
```

### Correr para desarrollo
Ejecuta el linter y reinicia el proceso al encontrar cambios en el código
``` bash
npm run dev
```

### Transpilar para producción
Compila y limpia todas las fuentes para usar en producción. El compilado queda en el directorio `dist`.
Tamibién reduce el código con envify y uglify.
``` bash
npm run build
```
