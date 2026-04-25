"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var resources_1 = require("resources")
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
function getStatusCode(errs) {
  return resources_1.resources.isTypeError(errs) ? 400 : 422
}
exports.getStatusCode = getStatusCode
function respondError(res, errors) {
  res.status(getStatusCode(errors)).json(errors).end()
}
exports.respondError = respondError
