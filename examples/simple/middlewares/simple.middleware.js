class SimpleMiddleware {
  constructor(di) {
    this.di = di;
    // this.responder = this.di.get('responder');
    // this.responder.setServerResponse(this.di.get('response'));
  }
  Init(settings, req, res, next) {
    console.log('====================');
    console.log('SIMPLE MIDDLEWARE');
    console.log('====================');
    // next(settings);
  }
}

module.exports = SimpleMiddleware;

// module.exports = function Init(settings, req, res, next) {
//   console.log('====================');
//   console.log('SIMPLE MIDDLEWARE');
//   console.log('====================');
//   next(settings);
// };
