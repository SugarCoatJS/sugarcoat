// vim: set tw=99 ts=2 sw=2 et:

// XMLHttpRequest API
// <https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest>

'use strict';

const xhrUnsent = 0;
const xhrOpened = 1;
const xhrHeadersReceived = 2;
const xhrLoading = 3;
const xhrDone = 4;

const xhrDeferredHandleSymbol = Symbol('deferredHandle');

const xhrOnLoadStartSymbol = Symbol('onloadstart');
const xhrOnProgressSymbol = Symbol('onprogress');
const xhrOnAbortSymbol = Symbol('onabort');
const xhrOnErrorSymbol = Symbol('onerror');
const xhrOnLoadSymbol = Symbol('onload');
const xhrOnTimeoutSymbol = Symbol('ontimeout');
const xhrOnLoadEndSymbol = Symbol('onloadend');

const xhrOnReadyStateChangeSymbol = Symbol('onreadystatechange');
const xhrReadyStateSymbol = Symbol('readyState');
const xhrTimeoutSymbol = Symbol('timeout');
const xhrWithCredentialsSymbol = Symbol('withCredentials');
const xhrUploadSymbol = Symbol('upload');
const xhrResponseTypeSymbol = Symbol('responseType');

const defineEvent = (obj, symbol) => {
  const type = symbol.description.substring(2);

  Object.defineProperty(obj, symbol, {
    configurable: false,
    enumerable: false,
    value: null,
    writable: true,
  });

  obj.addEventListener(type, function (event) {
    const handler = this[symbol];
    if (handler) {
      handler.call(this, event);
    }
  });
};

const changeReadyState = (xhr, readyState) => {
  xhr[xhrReadyStateSymbol] = readyState;
  xhr.dispatchEvent(new Event('readystatechange'));
};

let isSealed = true;

class XMLHttpRequestEventTarget extends EventTarget {
  constructor () {
    super();

    if (!(this instanceof XMLHttpRequest) && !(this instanceof XMLHttpRequestUpload)) {
      throw new TypeError('Illegal constructor');
    }

    defineEvent(this, xhrOnLoadStartSymbol);
    defineEvent(this, xhrOnProgressSymbol);
    defineEvent(this, xhrOnAbortSymbol);
    defineEvent(this, xhrOnErrorSymbol);
    defineEvent(this, xhrOnLoadSymbol);
    defineEvent(this, xhrOnTimeoutSymbol);
    defineEvent(this, xhrOnLoadEndSymbol);
  }

  get onloadstart () {
    return this[xhrOnLoadStartSymbol];
  }

  set onloadstart (value) {
    this[xhrOnLoadStartSymbol] = value;
  }

  get onprogress () {
    return this[xhrOnProgressSymbol];
  }

  set onprogress (value) {
    this[xhrOnProgressSymbol] = value;
  }

  get onabort () {
    return this[xhrOnAbortSymbol];
  }

  set onabort (value) {
    this[xhrOnAbortSymbol] = value;
  }

  get onerror () {
    return this[xhrOnErrorSymbol];
  }

  set onerror (value) {
    this[xhrOnErrorSymbol] = value;
  }

  get ontimeout () {
    return this[xhrOnTimeoutSymbol];
  }

  set ontimeout (value) {
    this[xhrOnTimeoutSymbol] = value;
  }

  get onloadend () {
    return this[xhrOnLoadEndSymbol];
  }

  set onloadend (value) {
    this[xhrOnLoadEndSymbol] = value;
  }
}

exports.XMLHttpRequestEventTarget = {
  configurable: true,
  enumerable: true,
  value: XMLHttpRequestEventTarget,
  writable: true,
};

class XMLHttpRequestUpload extends XMLHttpRequestEventTarget {
  constructor () {
    if (isSealed) {
      throw new TypeError('Illegal constructor');
    }

    super();
  }
}

exports.XMLHttpRequestUpload = {
  configurable: true,
  enumerable: true,
  value: XMLHttpRequestUpload,
  writable: true,
};

class XMLHttpRequest extends XMLHttpRequestEventTarget {
  constructor () {
    super();

    isSealed = false;
    const xhrUpload = new XMLHttpRequestUpload();
    isSealed = true;

    Object.defineProperty(this, xhrDeferredHandleSymbol, {
      configurable: false,
      enumerable: false,
      value: null,
      writable: true,
    });

    defineEvent(this, xhrOnReadyStateChangeSymbol);

    Object.defineProperty(this, xhrReadyStateSymbol, {
      configurable: false,
      enumerable: false,
      value: xhrUnsent,
      writable: true,
    });

    Object.defineProperty(this, xhrTimeoutSymbol, {
      configurable: false,
      enumerable: false,
      value: 0,
      writable: true,
    });

    Object.defineProperty(this, xhrWithCredentialsSymbol, {
      configurable: false,
      enumerable: false,
      value: false,
      writable: true,
    });

    Object.defineProperty(this, xhrUploadSymbol, {
      configurable: false,
      enumerable: false,
      value: xhrUpload,
      writable: false,
    });

    Object.defineProperty(this, xhrResponseTypeSymbol, {
      configurable: false,
      enumerable: false,
      value: '',
      writable: true,
    });
  }

  get onreadystatechange () {
    return this[xhrOnReadyStateChangeSymbol];
  }

  set onreadystatechange (value) {
    this[xhrOnReadyStateChangeSymbol] = value;
  }

  get readyState () {
    return this[xhrReadyStateSymbol];
  }

  open (method, url) {
    switch (this[xhrReadyStateSymbol]) {
      case xhrUnsent:
      case xhrDone: {
        changeReadyState(this, xhrOpened);
        break;
      }
    }
  }

  setRequestHeader (name, value) {}

  setTrustToken (trustToken) {}

  get timeout () {
    return this[xhrTimeoutSymbol];
  }

  set timeout (value) {
    this[xhrTimeoutSymbol] = value;
  }

  get withCredentials () {
    return this[xhrWithCredentialsSymbol];
  }

  set withCredentials (value) {
    switch (this[xhrReadyStateSymbol]) {
      case xhrUnsent:
      case xhrOpened: {
        break;
      }
      default: {
        throw new DOMException(
          "Failed to set the 'withCredentials' property on 'XMLHttpRequest': The value may only be set if the object's state is UNSENT or OPENED."
        );
      }
    }

    this[xhrWithCredentialsSymbol] = !!value;
  }

  get upload () {
    return this[xhrUploadSymbol];
  }

  send () {
    if (this[xhrReadyStateSymbol] === xhrOpened && this[xhrDeferredHandleSymbol] === null) {
      this[xhrDeferredHandleSymbol] = setTimeout(() => {
        this[xhrDeferredHandleSymbol] = null;
        changeReadyState(this, xhrDone);
        this.dispatchEvent(new ProgressEvent('error'));
        this.dispatchEvent(new ProgressEvent('loadend'));
      }, 0);
    } else {
      throw new DOMException(
        "Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED."
      );
    }
  }

  abort () {
    if (this[xhrReadyStateSymbol] === xhrOpened && this[xhrDeferredHandleSymbol] !== null) {
      clearTimeout(this[xhrDeferredHandleSymbol]);
      this[xhrDeferredHandleSymbol] = null;

      changeReadyState(this, xhrUnsent);
      this.dispatchEvent(new ProgressEvent('abort'));
      this.dispatchEvent(new ProgressEvent('loadend'));
    }
  }

  get responseURL () {
    return '';
  }

  get status () {
    return 0;
  }

  get statusText () {
    return '';
  }

  getResponseHeader (name) {
    return null;
  }

  overrideMimeType (mime) {}

  get responseType () {
    return this[xhrResponseTypeSymbol];
  }

  set responseType (value) {
    switch (this[xhrReadyStateSymbol]) {
      case xhrDone: {
        throw new DOMException(
          "Failed to set the 'responseType' property on 'XMLHttpRequest': The response type cannot be set if the object's state is LOADING or DONE."
        );
      }
    }

    switch (value) {
      case '':
      case 'arraybuffer':
      case 'blob':
      case 'document':
      case 'json':
      case 'text': {
        this[xhrResponseTypeSymbol] = value;
        break;
      }
    }
  }

  get response () {
    const responseType = this[xhrResponseTypeSymbol];
    return responseType === '' || responseType === 'text' ? '' : null;
  }

  get responseText () {
    const responseType = this[xhrResponseTypeSymbol];
    if (responseType === '' || responseType === 'text') {
      return '';
    } else {
      throw new DOMException(
        "Failed to read the 'responseText' property from 'XMLHttpRequest': The value is only accessible if the object's 'responseType' is '' or 'text' (was 'arraybuffer')."
      );
    }
  }

  get responseXML () {
    return null;
  }
}

Object.defineProperty(XMLHttpRequest, 'UNSENT', {
  configurable: false,
  enumerable: true,
  value: xhrUnsent,
});

Object.defineProperty(XMLHttpRequest, 'OPENED', {
  configurable: false,
  enumerable: true,
  value: xhrOpened,
});

Object.defineProperty(XMLHttpRequest, 'HEADERS_RECEIVED', {
  configurable: false,
  enumerable: true,
  value: xhrHeadersReceived,
});

Object.defineProperty(XMLHttpRequest, 'LOADING', {
  configurable: false,
  enumerable: true,
  value: xhrLoading,
});

Object.defineProperty(XMLHttpRequest, 'DONE', {
  configurable: false,
  enumerable: true,
  value: xhrDone,
});

exports.XMLHttpRequest = {
  configurable: true,
  enumerable: true,
  value: XMLHttpRequest,
  writable: true,
};
