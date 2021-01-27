// vim: set tw=99 ts=2 sw=2 et:

// Web Storage API
// <https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API>

'use strict';

let isSealed = false;

class Storage {
  constructor () {
    if (isSealed) {
      throw new TypeError('Illegal constructor');
    }
  }

  get length () {
    return Object.keys(this).length;
  }

  key (index) {
    const keys = Object.keys(this);
    if (index < 0 || index >= keys.length) {
      return null;
    }
    return keys[index];
  }

  getItem (key) {
    return Object.prototype.hasOwnProperty.call(this, key) ? this[key] : null;
  }

  setItem (key, value) {
    this[key] = String(value);
  }

  removeItem (key) {
    delete this[key];
  }

  clear () {
    const keys = Object.keys(this);
    for (const key of keys) {
      delete this[key];
    }
  }
}

exports.Storage = {
  configurable: true,
  enumerable: true,
  value: Storage,
  writable: true,
};

const localStorage = new Storage();

exports.localStorage = {
  configurable: true,
  enumerable: true,
  get () {
    return localStorage;
  },
};

const sessionStorage = new Storage();

exports.sessionStorage = {
  configurable: true,
  enumerable: true,
  get () {
    return sessionStorage;
  },
};

isSealed = true;
