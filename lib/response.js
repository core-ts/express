"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function handleError(err, res, log) {
  if (log) {
    log(err);
    res.status(500).end('Internal Server Error');
  }
  else {
    res.status(500).end(err);
  }
}
exports.handleError = handleError;
