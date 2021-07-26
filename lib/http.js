"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDate = exports.getRequiredDate = exports.getInteger = exports.getNumber = exports.getRequiredNumber = exports.getRequiredParameters = exports.params = exports.param = exports.queryDate = exports.queryRequiredDate = exports.queryNumber = exports.queryRequiredNumber = exports.query = exports.queryParam = exports.queryParams = exports.queryRequiredParams = exports.respondModel = exports.attrs = exports.attr = exports.handleError = void 0;
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
function attr(name) {
  return { name: name, type: 'string' };
}
exports.attr = attr;
function attrs(keys) {
  var atts = [];
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var str = keys_1[_i];
    var at = { name: str, type: 'string' };
    atts.push(at);
  }
  return atts;
}
exports.attrs = attrs;
function respondModel(obj, res) {
  if (obj) {
    res.status(200).json(obj).end();
  }
  else {
    res.status(404).json(null).end();
  }
}
exports.respondModel = respondModel;
function queryRequiredParams(req, res, name, split) {
  var v = req.query[name];
  if (!v) {
    res.status(400).end("'" + name + "' cannot be empty");
    return undefined;
  }
  var v2 = v.toString();
  if (v2.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty");
    return undefined;
  }
  if (!split) {
    split = ',';
  }
  return v2.split(split);
}
exports.queryRequiredParams = queryRequiredParams;
function queryParams(req, name, d, split) {
  var q = req.query[name];
  var v = q && q.toString();
  if (!v || v.length === 0) {
    return d;
  }
  if (!split) {
    split = ',';
  }
  return v.split(split);
}
exports.queryParams = queryParams;
function queryParam(req, res, name) {
  var v = req.query[name].toString();
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty");
    return undefined;
  }
  return v;
}
exports.queryParam = queryParam;
function query(req, name, d) {
  var p = req.query[name];
  if (!p || p.toString().length === 0) {
    return d;
  }
  return p.toString();
}
exports.query = query;
function queryRequiredNumber(req, res, name) {
  var field = req.query[name];
  var v = field.toString();
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty");
    return undefined;
  }
  if (isNaN(v)) {
    res.status(400).end("'" + name + "' is not a valid number");
    return undefined;
  }
  var n = parseFloat(v);
  return n;
}
exports.queryRequiredNumber = queryRequiredNumber;
function queryNumber(req, name, d) {
  var field = req.query[name];
  var v = field ? field.toString() : undefined;
  if (!v || v.length === 0) {
    return d;
  }
  if (isNaN(v)) {
    return d;
  }
  var n = parseFloat(v);
  return n;
}
exports.queryNumber = queryNumber;
function queryRequiredDate(req, res, name) {
  var field = req.query[name];
  var v = field.toString();
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty");
    return undefined;
  }
  var date = new Date(v);
  if (date.toString() === 'Invalid Date') {
    res.status(400).end("'" + name + "' is not a valid date");
    return undefined;
  }
  return date;
}
exports.queryRequiredDate = queryRequiredDate;
function queryDate(req, name, d) {
  var field = req.query[name];
  if (field) {
    var v = field.toString();
    if (!v || v.length === 0) {
      return d;
    }
    var date = new Date(v);
    if (date.toString() === 'Invalid Date') {
      return d;
    }
    return date;
  }
  return undefined;
}
exports.queryDate = queryDate;
function param(req, res, name) {
  var v = req.params[name];
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty");
    return undefined;
  }
  return v;
}
exports.param = param;
function params(req, name, d, split) {
  var v = req.params[name];
  if (!v || v.length === 0) {
    return d;
  }
  if (!split) {
    split = ',';
  }
  return v.split(split);
}
exports.params = params;
function getRequiredParameters(req, res, name, split) {
  var v = req.params[name];
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty");
    return undefined;
  }
  if (!split) {
    split = ',';
  }
  return v.split(split);
}
exports.getRequiredParameters = getRequiredParameters;
function getRequiredNumber(req, res, name) {
  var v = req.params[name];
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty");
    return undefined;
  }
  if (isNaN(v)) {
    res.status(400).end("'" + name + "' must be a number");
    return undefined;
  }
  var n = parseFloat(v);
  return n;
}
exports.getRequiredNumber = getRequiredNumber;
function getNumber(req, name, d) {
  var v = req.params[name];
  if (!v || v.length === 0) {
    return d;
  }
  if (isNaN(v)) {
    return d;
  }
  var n = parseFloat(v);
  return n;
}
exports.getNumber = getNumber;
function getInteger(req, name, d) {
  var v = req.params[name];
  if (!v || v.length === 0) {
    return d;
  }
  if (isNaN(v)) {
    return d;
  }
  var n = parseFloat(v);
  var s = n.toFixed(0);
  return parseFloat(s);
}
exports.getInteger = getInteger;
function getRequiredDate(req, res, name) {
  var v = req.params[name];
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty");
    return undefined;
  }
  var date = new Date(v);
  if (date.toString() === 'Invalid Date') {
    res.status(400).end("'" + name + "' must be a date");
    return undefined;
  }
  return date;
}
exports.getRequiredDate = getRequiredDate;
function getDate(req, name, d) {
  var v = req.params[name];
  if (!v || v.length === 0) {
    return d;
  }
  var date = new Date(v);
  if (date.toString() === 'Invalid Date') {
    return d;
  }
  return date;
}
exports.getDate = getDate;
