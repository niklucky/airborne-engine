"use strict";
const Engine = require('./../index.js');

const config = require('./config/config');
const routes = require('./config/routes');

const controllers = require('./controllers');
const modules = require('./config/modules');
const services = require('./config/services');

const validator = new Engine.Validator();

var app = new Engine.Airborne(config);
app.routes(routes)
    .services(services)
    .modules(modules)
    .controllers(controllers)
    .validator(validator);
    
app.start();
