"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var response_1 = require("./response");
function initializeStatus(s) {
  if (s) {
    return s;
  }
  var s1 = {
    duplicate_key: 0,
    not_found: 0,
    success: 1,
    version_error: 2,
    error: 4
  };
  return s1;
}
exports.initializeStatus = initializeStatus;
function checkId(obj, id, keys) {
  var n = 'id';
  if (keys && keys.length === 1) {
    n = keys[0].name;
  }
  if (!keys || keys.length === 1) {
    var v = obj[n];
    if (!v) {
      obj[n] = id;
      return true;
    }
    if (v != id) {
      return false;
    }
    return true;
  }
  var ks = Object.keys(id);
  for (var _i = 0, ks_1 = ks; _i < ks_1.length; _i++) {
    var k = ks_1[_i];
    var v = obj[k];
    if (!v) {
      obj[k] = id[k];
    }
    else {
      if (v != id[k]) {
        return false;
      }
    }
    obj[k] = id[k];
  }
  return true;
}
exports.checkId = checkId;
function create(res, status, obj, insert, log) {
  insert(obj).then(function (result) {
    if (typeof result === 'number') {
      if (result >= 1) {
        var r = { status: status.success, value: obj };
        res.status(201).json(r);
      }
      else if (result === 0) {
        var r = { status: status.duplicate_key };
        res.status(201).json(r);
      }
      else {
        res.status(500).end('Internal Server Error');
      }
    }
    else {
      res.status(200).json(result);
    }
  }).catch(function (err) { return response_1.handleError(err, res, log); });
}
exports.create = create;
function update(res, status, obj, save, log) {
  save(obj).then(function (result) {
    if (typeof result === 'number') {
      if (result >= 1) {
        var r = { status: status.success, value: obj };
        res.status(201).json(r);
      }
      else if (result === 0) {
        var r = { status: status.not_found };
        res.status(404).json(r);
      }
      else {
        var r = { status: status.not_found };
        res.status(409).json(r);
      }
    }
    else {
      res.status(200).json(result);
    }
  }).catch(function (err) { return response_1.handleError(err, res, log); });
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
