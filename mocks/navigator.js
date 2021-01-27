// vim: set tw=99 ts=2 sw=2 et:

// Navigator API
// <https://developer.mozilla.org/en-US/docs/Web/API/Navigator>

'use strict';

exports.doNotTrack = {
  configurable: true,
  enumerable: true,
  get () {
    return '1';
  },
};

exports.productSub = {
  configurable: true,
  enumerable: true,
  get () {
    return 20030107;
  },
};

exports.vendor = {
  configurable: true,
  enumerable: true,
  get () {
    return '';
  },
};
