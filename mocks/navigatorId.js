// vim: set tw=99 ts=2 sw=2 et:

// NavigatorID API
// <https://developer.mozilla.org/en-US/docs/Web/API/NavigatorID>

'use strict';

exports.appVersion = {
  configurable: true,
  enumerable: true,
  get () {
    return '5.0';
  },
};

exports.platform = {
  configurable: true,
  enumerable: true,
  get () {
    return '';
  },
};

exports.userAgent = {
  configurable: true,
  enumerable: true,
  get () {
    return 'Mozilla/5.0';
  },
};
