import DI from './core/di';
import Validator from './core/validator';
// import AuthMiddleware from './core/auth.middleware';
import Responder from './core/responder';
// import { request } from 'http';

const lib = require('./lib');
const express = require('express');
const bodyParser = require('body-parser');
// const util = require('util');

const defaultConfig = require('./core/config.js');
const DbAdapter = require('./core/db.adapter.js');

class Airborne {
  constructor(config) {
    if (typeof config !== 'object') {
      throw new Error('Fatal: Engine error: config is not an object. Failed to start');
    }
    this.instances = [];
    this.di = new DI();
    this.config = Object.assign({}, defaultConfig, config);
    this.di.set('config', this.config);
    this.multipartParser = null;

    if (this.di.get('config').db) {
      this.database(this.di.get('config').db);
    }
  }

  services(services) {
    this.di.set('services', services);
    return this;
  }

  controllers(controllers) {
    this.di.set('controllers', controllers);
    return this;
  }

  modules(modules) {
    this.di.set('modules', modules);
    return this;
  }

  routes(routes) {
    this.di.set('routes', routes);
    return this;
  }

  // middlewares(middlewares) {
  //   this.di.set('middlewares', middlewares);
  //   return this;
  // }

  validator(validator) {
    if (validator === true) {
      this.di.set('validator', Validator);
    }
    return this;
  }

  database(dbConfig) {
    this.di.set('db', new DbAdapter(dbConfig));
    return this;
  }

  start() {
    this.express = express();

    const RouterObj = express.Router;
    const router = new RouterObj({
      mergeParams: true
    });
    // const asyncMiddleware = fn => (req, res, next) => {
    //   Promise.resolve(fn(req, res, next))
    //     .catch(next);
    // };

    this.express.use(bodyParser.json({ limit: '100mb' }));
    this.express.use(bodyParser.urlencoded({ extended: true, limit: '100mb', parameterLimit: 1000000 }));

    /* istanbul ignore next */
    const routes = this.di.get('routes');

    this.express.use((req, res, next) => {
      this.di.set('request', req);
      this.di.set('response', res);
      this.di.set('method', req.method);
      console.log('INITIALIZED');
      this.responder = new Responder(this.di.get('config'));
      this.di.set('responder', this.responder);

      next();
    });
    this.express.use((req, res, next) => {
      console.log('ROUTE', this.di.get('request').originalUrl.match(/[a-z]*/ig));
      console.log('URL', this.di.get('request').url);
      console.log('PATH', this.di.get('request').path);
      next();
    });

    for (let route in routes) { // eslint-disable-line
      for (let method in routes[route]) { // eslint-disable-line
        router[method](route, (request, response, next) => { // eslint-disable-line
          const routeSettings = routes[route][method];
          const handlerMethod = routeSettings.method;
          const originalRoute = route;
          const routeHandler = routeSettings.handler;
          let middlewares = null;
          if (routeSettings.middleware !== undefined && routeSettings.middleware.length !== 0) {
            console.log(routeSettings.middleware);
            middlewares = routeSettings.middleware;
          }
          console.log('MID', middlewares);

          if (routeSettings.method === undefined) {
            routeSettings.method = 'get';
          }
          if (routeSettings.handler === undefined) {
            throw new Error('[Fatal] routes config: handler method required');
          }
          console.log('HANDLER', this.handler);
          return next({
            route: originalRoute,
            method: handlerMethod,
            handler: routeHandler,
            middlewares: middlewares
          });
        });
        // console.log('AUTH', this.handler);

        // router.use(async (settings, request, response, next) => { // eslint-disable-line
        //   if (settings.auth) {
        //     if (!await new AuthMiddleware(this.di).initAuth()) {
        //       return;
        //     }
        //   }
        //   await this.handle(settings.handler, settings.method, request, response);
        //   // next();
        // });
      }
    }
    // const middlewares = this.di.get('middlewares');
    // console.log('MW', middlewares);
    // if (middlewares !== null) { // eslint-disable-line
    //   for (let middleware in middlewares) { // eslint-disable-line
    //     console.log('mw', middleware);
    //     console.log(middlewares[middleware].route);
    //     console.log(middlewares[middleware].MDmodule);
    //     router.use(async (settings, request, response, next) => { // eslint-disable-line

    //       // console.log('SETTINGS', settings);
    //       if (settings.route === middlewares[middleware].route) { // eslint-disable-line
    //         const moduleMD = new middlewares[middleware].module(this.di); // eslint-disable-line
    //         await moduleMD.Init(); // eslint-disable-line
    //       }
    //       next(settings);
    //     });
    //   }
    // }

    // router.use((settings, request, response, next) => {
    //   // console.log('SETTINGS', settings);
    //   if (settings.middlewares !== undefined && settings.middlewares.length !== 0) {
    //     settings.middlewares.forEach((middleware) => {
    //       const mwModule = new middleware(this.di).Init(); // eslint-disable-line
    //       // console.log('MODULE', mwModule);
    //       // mwModule.Init(); // eslint-disable-line
    //     });
    //   }
    //   next(settings);
    // });

    // router.use((settings, request, response, next) => {// eslint-disable-line
    //   console.log('SETTINGS', settings);
    //   if (settings.middlewares !== undefined && settings.middlewares.length !== 0) {
    //     return settings.middlewares.reduce((promise, middleware) => promise.then(() => {
    //       new middleware(this.di).Init(); // eslint-disable-line
    //       // console.log('MODULE', mwModule);
    //         // mwModule.Init(); // eslint-disable-line
    //     }).then(() => next(settings)), Promise.resolve());
    //   }
    //   next(settings);
    // });

    // router.use((settings, request, response, next) => { // eslint-disable-line
    //   console.log('HANDLE MID');
    //   // console.log('SET', settings);
    //   if (settings.middlewares !== undefined && settings.middlewares.length !== 0) {
    //     Promise.all(settings.middlewares.map(Middleware =>
    //       new Middleware(this.di).Init(settings, request, response, next)))
    //     .catch((err) => console.log(err))

    // });

  // router.use((settings, request, response, next) => { // eslint-disable-line
  //     console.log('HANDLE MID');
  //     // console.log('SET', settings);
  //     if (settings.middlewares !== undefined && settings.middlewares.length !== 0) {
  //       Promise.all(settings.middlewares.map(Middleware =>
  //         new Middleware(this.di).Init(settings, request, response, next)))
  //       .catch((err) => console.log(err))
  //   });


    router.use((settings, request, response, next) => {
      if (settings.middlewares !== undefined && settings.middlewares.length !== 0) {
        Promise.all(settings.middlewares.map(Middleware => new Middleware(this.di).Init(
          settings, request, response, next
        )))
        .catch((err) => {
          throw new Error(err);
        });
      }
      // next(settings);
    });

    // router.use((settings, request, response, next) => { // eslint-disable-line
    //   new settings.middlewares[0](this.di).Init(settings, request, response, next);
    //   // next();
    // });


    router.use((settings, request, response, next) => { // eslint-disable-line
      console.log('HANDLE MID');
      console.log('SET', settings);
      if (settings.handler !== undefined) {
        this.handle(settings.handler, settings.method, request, response);
        // next();
      }
      // next();
    });


    console.log('Before app.use()');
    this.express.use('/', router);
    this.express.use(function (request, response, next) { // eslint-disable-line
      response.send(404, { status: 404, message: 'Route not found' });
    });

    /* istanbul ignore next */
    const server = this.express.listen(
      this.config.port,
      this.config.host,
      () => {
        console.log(`Server running at ${server.address().address}:${server.address().port}`);
      });
  }

  handle(Controller, method, request, response) {
    console.log('In handle');
    if (request.headers['content-type'] !== undefined && request.headers['content-type']
    .indexOf('multipart/form-data') !== -1) {
      return this.handleMultipart(Controller, method, request, response);
    } else { // eslint-disable-line
      return this.handleSimple(Controller, method, request, response);
    }
  }

  handleMultipart(Controller, method, request, response) {
    try {
      if (this.multipartParser === null) {
        require.resolve('formidable');
        this.multipartParser = require('formidable');
      }
      const form = new this.multipartParser.IncomingForm();
      form.parse(request, (err, fields, files) => {
        const req = request;
        req.body = this.mergeFilesInFields(request.body, fields, files);
        return this.handleSimple(Controller, method, request, response);
      });
    } catch (err) {
      console.error('formidable module is not found. It is used to parse multipart form-data. Install: npm i --save formidable');
      console.log('e', err);
      response.send('Error parsing multipart/form-data');
    }
  }

  handleSimple(Controller, method, request, response) {
    console.log('In handleSimple');
    if (typeof request !== 'object') {
      throw new Error('[Fatal] Application handle: request is not an object');
    }
    if (typeof response !== 'object') {
      throw new Error('[Fatal] Application handle: response is not an object');
    }
    console.log('Before ctrl initializing');
    // console.log(Controller);
    const ctrl = new Controller(this.di);
    console.log('Controller', ctrl);
    return ctrl.validate(method, request.params)
      .then((data) => {
        // console.log('res from handle', data);
        this.createResponse(data, response);
      })
      .catch((err) => {
        this.createErrorResponse(err, response);
      });
  }

  createResponse(data, response) {
    const responder = this.di.get('responder');
    responder.setServerResponse(response);
    responder.send(data);
  }

  createErrorResponse(err, response) {
    const responder = this.di.get('responder');
    responder.setServerResponse(response);
    responder.sendError('ERROR', 404);
  }
  mergeFilesInFields(body, fields, files) { // eslint-disable-line
    const newBody = body;
    for (const name in files) { // eslint-disable-line
      newBody[name] = files[name];
    }
    for (const name in fields) { // eslint-disable-line
      newBody[name] = fields[name];
    }
    return newBody;
  }
  setInstance(dispatcher) { // eslint-disable-line class-methods-use-this
    this.instances.push(dispatcher);
  }
}
lib.Engine = Airborne;

export default lib;
