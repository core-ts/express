"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("./http");
function initializeStatus(s) {
  if (s) {
    return s;
  }
  var s1 = {
    duplicate_key: 0,
    not_found: 0,
    success: 1,
    version_error: 2,
    validation_error: 4,
    error: 4
  };
  return s1;
}
exports.initializeStatus = initializeStatus;
function checkId(obj, id, keys) {
  var n = (keys && keys.length === 1 && keys[0].name ? keys[0].name : 'id');
  var o = obj;
  var i = id;
  if (!keys || keys.length === 1) {
    var v = o[n];
    if (!v) {
      o[n] = i;
      return true;
    }
    if (v != i) {
      return false;
    }
    return true;
  }
  var ks = Object.keys(i);
  for (var _i = 0, ks_1 = ks; _i < ks_1.length; _i++) {
    var k = ks_1[_i];
    var v = o[k];
    if (!v) {
      o[k] = i[k];
    }
    else {
      if (v != i[k]) {
        return false;
      }
    }
    o[k] = i[k];
  }
  return true;
}
exports.checkId = checkId;
function create(res, status, obj, insert, log) {
  insert(obj).then(function (result) {
    if (typeof result === 'number') {
      if (result >= 1) {
        var r = { status: status.success, value: obj };
        res.status(201).json(r).end();
      }
      else if (result === 0) {
        var r = { status: status.duplicate_key };
        res.status(201).json(r).end();
      }
      else {
        res.status(500).end('Internal Server Error');
      }
    }
    else {
      res.status(200).json(result).end();
    }
  }).catch(function (err) { return http_1.handleError(err, res, log); });
}
exports.create = create;
function update(res, status, obj, save, log) {
  save(obj).then(function (result) {
    if (typeof result === 'number') {
      if (result >= 1) {
        var r = { status: status.success, value: obj };
        res.status(201).json(r).end();
      }
      else if (result === 0) {
        var r = { status: status.not_found };
        res.status(404).json(r).end();
      }
      else {
        var r = { status: status.not_found };
        res.status(409).json(r).end();
      }
    }
    else {
      res.status(200).json(result).end();
    }
  }).catch(function (err) { return http_1.handleError(err, res, log); });
}
exports.update = update;
function isTypeError(errs) {
  if (!errs) {
    return false;
  }
  for (var _i = 0, errs_1 = errs; _i < errs_1.length; _i++) {
    var err = errs_1[_i];
    var c = err.code;
    if (c === 'string' || c === 'number' || c === 'date' || c === 'boolean') {
      return true;
    }
  }
  return false;
}
exports.isTypeError = isTypeError;
