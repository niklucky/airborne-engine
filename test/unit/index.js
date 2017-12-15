import { expect, assert } from 'chai';
import Airborne from '../../src/index';
import DI from '../../src/core/di';
import DbAdapter from '../../src/core/db.adapter';
import Validator from '../../src/core/validator';

import mocks from '../mocks';

class IncomingForm {
  parse(request, callback) {
    callback(null, { a: 1 }, { b: 2 });
  }
}
const formidableMock = {
  IncomingForm: IncomingForm
};

const config = {
  host: 'localhost',
  port: 3008,
  debug: true
};
const configDb = {
  host: 'localhost',
  port: 3008,
  debug: false,
  db: {
    mysql: {
      host: '127.0.0.1',
      port: 3306,
      driver: 'mysql',
      password: '12345',
      database: 'Airborne_test'
    }
  },
  source: {
    orders: 'orders',
    users: 'users'
  }
};

const routes = {
  '/': { auth: false }
};
const routesNoHandler = mocks.routesNoHandler;
const params = { 'orderId': 2 };
// const Controller = mocks.routes['/users'].handler;
const Controller = mocks.controller;
const method = mocks.routes['/users'].method;
const responder = mocks.responder;
const router = mocks.router;

const request = {
  url: '/',
  body: { c: 3 },
  headers: {}
};

const multipartRequest = {
  url: '/',
  body: { c: 3 },
  headers: {
    'Content-Type': 'multipart/form-data'
  }
};
const response = {
  send: () => {
    // console.log('Response send mock');
  },
  status: () => {
    // console.log('Response status mock');
  }
}
const { controllers } = mocks;

let app;

describe('Airborne application', () => {
  describe('Invalid params', () => {
    it('All params are undefined', () => {
      app = () => new Airborne();
      expect(app).to.throw(Error, /config is not an object. Failed to start/);
    });
  });
  describe('Simple config', () => {
    beforeEach(() => {
      app = new Airborne(config);
    });
    it('No database, simple config', () => {
      expect(app).to.have.property('di');
      expect(app).to.have.property('config');
      expect(app.config).to.be.an('object');
      expect(app.di).to.be.an.instanceOf(DI);
    });

    it('services init', () => {
      app.services({});
      expect(app).to.have.property('di');
      const services = app.di.get('services')
      expect(services).to.be.an('object');
    });
    it('controllers init', () => {
      app.controllers({});
      expect(app).to.have.property('di');
      const controllers = app.di.get('controllers');
      expect(controllers).to.be.an('object');
    });
    it('modules init', () => {
      app.modules({});
      expect(app).to.have.property('di');
      const modules = app.di.get('modules')
      expect(modules).to.be.an('object');
    });
    it('routes init', () => {
      app.routes(routes);
      expect(app).to.have.property('di');
      const object = app.di.get('routes')
      expect(object).to.be.an('object');
    });
    it('validator === true init', () => {
      app.validator(true);
      expect(app).to.have.property('di');
      const object = app.di.get('validator');
      expect(object).to.be.an('function');
    });
    it('validator === undefined init', () => {
      app.validator();
      expect(app).to.have.property('di');
      const object = app.di.get('validator');
      expect(object).to.be.an('undefined');
    });
  });
  describe('With databases', () => {
    it('MySQL database', () => {
      const app = new Airborne(configDb);
      expect(app).to.have.property('di');
      const db = app.di.get('db');
      expect(db.connections).to.have.property('mysql');
      expect(db).to.be.an.instanceOf(DbAdapter);
    });
  });
  describe('Start', () => {
    it('start', () => {
      const app = new Airborne(configDb);
      app.start();
      expect(app).to.have.property('express');
    });
    it('start calls express middlewares methods', () => {
      const app = new Airborne(configDb);
      app.start();
      expect(app.routeHandle).to.be.called;
      expect(app.middlewaresHandle).to.be.called;
      expect(app.sendToHandler).to.be.called;
    });
    it('handle with invalid params', () => {
      const app = new Airborne(configDb);
      const fn = () => app.handleSimple(
        Controller, method, request, response, undefined
      );
      expect(fn).to.throw(Error, /params is not an object/);
    });
    it('handle with invalid response', () => {
      const app = new Airborne(configDb);
      const fn = () => app.handleSimple(
        Controller, method, request, undefined, params
      );
      expect(fn).to.throw(Error, /response is not an object/);
    });
    it('handle with invalid request', () => {
      const app = new Airborne(configDb);
      const fn = () => app.handleSimple(
        Controller, method, undefined, response, params
      );
      expect(fn).to.throw(Error, /request is not an object/);
    });
    it('handleSimple', () => {
      const app = new Airborne(configDb);
      app.multipartParser = formidableMock;
      const fn = () => app.handle(
        Controller, method, request, response, params
      );
      expect(app.handleSimple).to.be.called;
    });
    it('handleMultipart', () => {
      const app = new Airborne(configDb);
      app.multipartParser = formidableMock;
      const fn = () => app.handle(
        Controller, method, multipartRequest, response, params
      );
      expect(app.handleMultipart).to.be.called;
    });
    it('handleMultipart calls mergeFilesInFields', () => {
      const app = new Airborne(configDb);
      app.multipartParser = formidableMock;
      const fn = () => app.handleMultipart(
        Controller, method, multipartRequest, response, params
      );
      expect(app.mergeFilesInFields).to.be.called;
    });
    it('mergefilesInFields returns Object', () => {
      const app = new Airborne(configDb);
      const result = app.mergeFilesInFields({}, {}, {});
      expect(result).to.be.an('object');
    });
    it('handleSimple calls createResponse', () => {
      const app = new Airborne(config);
      // app.multipartParser = formidableMock;
      const fn = () => app.handleSimple(
        Controller, method, request, response, params
      );
      expect(app.createResponse).to.be.called;
    });
    it('start calls handle', () => {
      const app = new Airborne(configDb);
      const fn = () => app.start();
      expect(app.handle).to.be.called;
    });
    it('router.use is a function', () => {
      const app = new Airborne(configDb);
      const start = () => app.start();
      const fn = () => {
        start.router.use();
      };
      expect(fn).to.be.an('function');
    });
    it('express has request', () => {
      const app = new Airborne(configDb);
      app.start();
      const express = app.express;
      expect(express).to.have.property('request');
    });
    it('express has response', () => {
      const app = new Airborne(configDb);
      app.start();
      const express = app.express;
      expect(express).to.have.property('response');
    });
  });
  describe('Handling methods', () => {
    it('middlewaresHandle', () => {
      const app = Airborne;
      const fn = () => app.middlewaresHandle(router);
      expect(fn.next).to.be.called;
    });
    it('routeHandle()', () => {
      const app = Airborne;
      const fn = () => app.routeHandle(routes, router);
      expect(fn.next).to.be.called;
    });
    it('sendToHandler calls handle()', () => {
      const app = Airborne;
      const fn = () => app.sendToHandler(router);
      expect(app.handle).to.be.called;
    });
  });
});
