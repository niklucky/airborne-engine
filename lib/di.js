class DI {
  constructor () {
    this.di = {};
  }

  set (diName, diValue) {
    this.di[diName] = diValue;
    return this;
  }

  get (diName) {
    return this.di[diName];
  }
}

module.exports = DI;