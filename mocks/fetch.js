// vim: set tw=99 ts=2 sw=2 et:

// Fetch API
// <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API>

'use strict';

const fetch = async (resource, init = null) => {
  throw new TypeError('Failed to fetch');
};

exports.fetch = {
  configurable: true,
  enumerable: true,
  value: fetch,
  writable: true,
};
