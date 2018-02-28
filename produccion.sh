#!/bin/bash

exportarVariables() {
    export NODE_ENV=production
    export PUERTO=3001
    export ORIGIN=http://labca.ciriscr.com
    export MONGO_URI=mongodb://localhost:29531/base
}

correr4ever() {
    forevername=base
    forever stop $forevername 2>/dev/null || :
    forever start --append --uid $forevername /software/base/backend/dist
}

exportarVariables
correr4ever
