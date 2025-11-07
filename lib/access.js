"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
function allow(access) {
  var ao = access.origin
  if (typeof ao === "string") {
    return function (req, res, next) {
      res.header("Access-Control-Allow-Origin", access.origin)
      res.header("Access-Control-Allow-Credentials", access.credentials)
      res.header("Access-Control-Allow-Methods", access.methods)
      res.setHeader("Access-Control-Allow-Headers", access.headers)
      next()
    }
  } else if (Array.isArray(ao) && ao.length > 0) {
    return function (req, res, next) {
      var origin = req.headers.origin
      if (origin) {
        if (ao.includes(origin)) {
          res.setHeader("Access-Control-Allow-Origin", origin)
        }
      }
      res.header("Access-Control-Allow-Credentials", access.credentials)
      res.header("Access-Control-Allow-Methods", access.methods)
      res.setHeader("Access-Control-Allow-Headers", access.headers)
      next()
    }
  }
  return function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", access.credentials)
    res.header("Access-Control-Allow-Methods", access.methods)
    res.setHeader("Access-Control-Allow-Headers", access.headers)
    next()
  }
}
exports.allow = allow
