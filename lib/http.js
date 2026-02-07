"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var resources_1 = require("./resources")
Object.defineProperty(Error.prototype, "toJSON", {
  value: function () {
    var alt = {}
    Object.getOwnPropertyNames(this).forEach(function (key) {
      alt[key] = this[key]
    }, this)
    return alt
  },
  configurable: true,
  writable: true,
})
function handleError(err, res) {
  if (resources_1.resources.log) {
    resources_1.resources.log(toString(err))
    res.status(500).end("Internal Server Error")
  } else {
    if (resources_1.resources.returnServerError) {
      res.status(500).end(toString(err))
    } else {
      console.error(toString(err))
      res.status(500).end("Internal Server Error")
    }
  }
}
exports.handleError = handleError
exports.error = handleError
function toString(v) {
  if (typeof v === "string") {
    return v
  } else {
    return JSON.stringify(v)
  }
}
exports.toString = toString
function attr(name) {
  return { name: name, type: "string" }
}
exports.attr = attr
function attrs(keys) {
  var atts = []
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var str = keys_1[_i]
    var at = { name: str, type: "string" }
    atts.push(at)
  }
  return atts
}
exports.attrs = attrs
function respondModel(obj, res) {
  if (obj) {
    res.status(200).json(obj).end()
  } else {
    res.status(404).json(null).end()
  }
}
exports.respondModel = respondModel
function queryRequiredParams(req, res, name, split) {
  var v = req.query[name]
  if (!v) {
    res.status(400).end("'" + name + "' cannot be empty")
    return undefined
  }
  var v2 = v.toString()
  if (v2.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty")
    return undefined
  }
  if (!split) {
    split = ","
  }
  return v2.split(split)
}
exports.queryRequiredParams = queryRequiredParams
function queryParams(req, name, d, split) {
  var q = req.query[name]
  if (!q) {
    return d
  }
  var v = q.toString()
  if (!v || v.length === 0) {
    return d
  }
  if (!split) {
    split = ","
  }
  return v.split(split)
}
exports.queryParams = queryParams
function queryParam(req, res, name) {
  var v = req.query[name]
  if (!v) {
    res.status(400).end("'" + name + "' cannot be empty")
    return undefined
  } else {
    var v1 = v.toString()
    if (v1.length === 0) {
      res.status(400).end("'" + name + "' cannot be empty")
      return undefined
    } else {
      return v1
    }
  }
}
exports.queryParam = queryParam
function query(req, name, d) {
  var p = req.query[name]
  if (!p || p.toString().length === 0) {
    return d
  }
  return p.toString()
}
exports.query = query
function queryRequiredNumber(req, res, name) {
  var field = req.query[name]
  if (!field) {
    return undefined
  }
  var v = field.toString()
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty")
    return undefined
  }
  if (isNaN(v)) {
    res.status(400).end("'" + name + "' is not a valid number")
    return undefined
  }
  var n = parseFloat(v)
  return n
}
exports.queryRequiredNumber = queryRequiredNumber
function queryNumber(req, name, d) {
  var field = req.query[name]
  var v = field ? field.toString() : undefined
  if (!v || v.length === 0) {
    return d
  }
  if (isNaN(v)) {
    return d
  }
  var n = parseFloat(v)
  return n
}
exports.queryNumber = queryNumber
function queryRequiredDate(req, res, name) {
  var field = req.query[name]
  if (!field) {
    return undefined
  }
  var v = field.toString()
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty")
    return undefined
  }
  var date = new Date(v)
  if (date.toString() === "Invalid Date") {
    res.status(400).end("'" + name + "' is not a valid date")
    return undefined
  }
  return date
}
exports.queryRequiredDate = queryRequiredDate
function queryDate(req, name, d) {
  var field = req.query[name]
  if (field) {
    var v = field.toString()
    if (!v || v.length === 0) {
      return d
    }
    var date = new Date(v)
    if (date.toString() === "Invalid Date") {
      return d
    }
    return date
  }
  return undefined
}
exports.queryDate = queryDate
function param(req, res, name) {
  var v = req.params[name]
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty")
    return undefined
  }
  return v
}
exports.param = param
exports.getParam = param
function params(req, name, d, split) {
  var v = req.params[name]
  if (!v || v.length === 0) {
    return d
  }
  if (!split) {
    split = ","
  }
  return v.split(split)
}
exports.params = params
exports.getParams = params
function getRequiredParameters(req, res, name, split) {
  var v = req.params[name]
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty")
    return undefined
  }
  if (!split) {
    split = ","
  }
  return v.split(split)
}
exports.getRequiredParameters = getRequiredParameters
function getRequiredNumber(req, res, name) {
  var v = req.params[name]
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty")
    return undefined
  }
  if (isNaN(v)) {
    res.status(400).end("'" + name + "' must be a number")
    return undefined
  }
  var n = parseFloat(v)
  return n
}
exports.getRequiredNumber = getRequiredNumber
function getNumber(req, name, d) {
  var v = req.params[name]
  if (!v || v.length === 0) {
    return d
  }
  if (isNaN(v)) {
    return d
  }
  var n = parseFloat(v)
  return n
}
exports.getNumber = getNumber
function getInteger(req, name, d) {
  var v = req.params[name]
  if (!v || v.length === 0) {
    return d
  }
  if (isNaN(v)) {
    return d
  }
  var n = parseFloat(v)
  var s = n.toFixed(0)
  return parseFloat(s)
}
exports.getInteger = getInteger
function getRequiredDate(req, res, name) {
  var v = req.params[name]
  if (!v || v.length === 0) {
    res.status(400).end("'" + name + "' cannot be empty")
    return undefined
  }
  var date = new Date(v)
  if (date.toString() === "Invalid Date") {
    res.status(400).end("'" + name + "' must be a date")
    return undefined
  }
  return date
}
exports.getRequiredDate = getRequiredDate
function getDate(req, name, d) {
  var v = req.params[name]
  if (!v || v.length === 0) {
    return d
  }
  var date = new Date(v)
  if (date.toString() === "Invalid Date") {
    return d
  }
  return date
}
exports.getDate = getDate
var o = "object"
function minimize(obj) {
  if (!obj || typeof obj !== o) {
    return obj
  }
  var keys = Object.keys(obj)
  for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
    var key = keys_2[_i]
    var v = obj[key]
    if (v == null) {
      delete obj[key]
    } else if (Array.isArray(v) && v.length > 0) {
      var v1 = v[0]
      if (typeof v1 === o && !(v1 instanceof Date)) {
        for (var _a = 0, v_1 = v; _a < v_1.length; _a++) {
          var item = v_1[_a]
          minimize(item)
        }
      }
    }
  }
  return obj
}
exports.minimize = minimize
function minimizeArray(arrs) {
  if (!arrs) {
    return arrs
  }
  if (arrs.length > 0) {
    for (var _i = 0, arrs_1 = arrs; _i < arrs_1.length; _i++) {
      var obj = arrs_1[_i]
      minimize(obj)
    }
  }
  return arrs
}
exports.minimizeArray = minimizeArray
