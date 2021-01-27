// vim: set tw=99 ts=2 sw=2 et:

'use strict';

// Document.cookie API
// <https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie>

const cookieJar = {};

exports.cookie = {
  enumerable: true,
  configurable: true,
  get () {
    return Object.entries(cookieJar)
      .map(([key, value]) => (value == null ? key : `${key}=${value}`))
      .join('; ');
  },
  set (value) {
    const pair = value.split(';')[0];
    const parts = pair.split('=');
    const cookieKey = parts.shift().trim();
    const cookieValue = parts.length > 0 ? parts.join('=').trim() : null;
    cookieJar[cookieKey] = cookieValue;
  },
};
