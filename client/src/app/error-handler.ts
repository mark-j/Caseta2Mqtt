import { ErrorHandler, Injectable } from '@angular/core';
const safeJsonStringify = require('safe-json-stringify');
const htmlToText = require('html-to-text');
const htmlPattern = /<\/?[a-z][\s\S]*>/i;

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  handleError(error) {
    let unwrappedError = error;

    if (error.error) {
      unwrappedError = error.error;
    }

    if (error.rejection) {
      unwrappedError = error.rejection;
    }

    if (error.rejection && error.rejection.error) {
      unwrappedError = error.rejection.error;
    }

    let message = typeof unwrappedError === 'string' || unwrappedError instanceof String
      ? unwrappedError
      : unwrappedError.message || unwrappedError.msg || safeJsonStringify(error);

    if (htmlPattern.test(message)) {
      message = htmlToText.fromString(message);
    }

    alert(message);
  }
}
