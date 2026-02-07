"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var http_1 = require("./http")
function checkId(obj, id, keys) {
  var n = keys && keys.length === 1 && keys[0].name ? keys[0].name : "id"
  var o = obj
  var i = id
  if (!keys || keys.length === 1) {
    var v = o[n]
    if (!v) {
      o[n] = i
      return true
    }
    if (v != i) {
      return false
    }
    return true
  }
  var ks = Object.keys(i)
  for (var _i = 0, ks_1 = ks; _i < ks_1.length; _i++) {
    var k = ks_1[_i]
    var v = o[k]
    if (!v) {
      o[k] = i[k]
    } else {
      if (v != i[k]) {
        return false
      }
    }
    o[k] = i[k]
  }
  return true
}
exports.checkId = checkId
function create(res, obj, insert, returnNumber) {
  insert(obj)
    .then(function (result) {
      if (typeof result === "number") {
        if (result >= 1) {
          res
            .status(201)
            .json(returnNumber ? result : obj)
            .end()
        } else {
          res.status(409).json(result).end()
        }
      } else if (Array.isArray(result)) {
        res.status(422).json(result).end()
      } else {
        res
          .status(201)
          .json(returnNumber ? result : obj)
          .end()
      }
    })
    .catch(function (err) {
      return http_1.handleError(err, res)
    })
}
exports.create = create
function update(res, obj, save, returnNumber) {
  save(obj)
    .then(function (result) {
      if (typeof result === "number") {
        if (result >= 1) {
          res
            .status(200)
            .json(returnNumber ? result : obj)
            .end()
        } else if (result === 0) {
          res.status(404).json(result).end()
        } else {
          res.status(409).json(result).end()
        }
      } else if (Array.isArray(result)) {
        res.status(422).json(result).end()
      } else {
        res
          .status(200)
          .json(returnNumber ? result : obj)
          .end()
      }
    })
    .catch(function (err) {
      return http_1.handleError(err, res)
    })
}
exports.update = update
function isTypeError(errs) {
  if (!errs) {
    return false
  }
  for (var _i = 0, errs_1 = errs; _i < errs_1.length; _i++) {
    var err = errs_1[_i]
    var c = err.code
    if (
      c === "type" ||
      c === "string" ||
      c === "number" ||
      c === "date" ||
      c === "boolean" ||
      c === "strings" ||
      c === "numbers" ||
      c === "integers" ||
      c === "dates" ||
      c === "datetimes" ||
      c === "booleans"
    ) {
      return true
    }
  }
  return false
}
exports.isTypeError = isTypeError
function getStatusCode(errs) {
  return isTypeError(errs) ? 400 : 422
}
exports.getStatusCode = getStatusCode
function respondError(res, errors) {
  res.status(getStatusCode(errors)).json(errors).end()
}
exports.respondError = respondError
