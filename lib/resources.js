"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var fs = require("fs")
var http = require("http")
var https = require("https")
var resources = (function () {
  function resources() {}
  resources.languageParam = "lang"
  resources.defaultLanguage = "en"
  resources.limits = [12, 24, 60, 100, 120, 180, 300, 600]
  resources.pages = "pages"
  resources.page = "page"
  resources.nextPageToken = "next"
  resources.limit = "limit"
  resources.defaultLimit = 12
  resources.sort = "sort"
  resources.fields = "fields"
  resources.partial = "partial"
  resources.encoding = "utf-8"
  return resources
})()
exports.resources = resources
function getView(req, view) {
  var partial = req.query[resources.partial]
  return partial === "true" ? resources.pages + "/" + view : view
}
exports.getView = getView
function isPartial(req) {
  return req.query[resources.partial] === "true"
}
exports.isPartial = isPartial
var TypeChecker = (function () {
  function TypeChecker(attributes, allowUndefined) {
    this.attributes = attributes
    this.allowUndefined = allowUndefined
    this.check = this.check.bind(this)
  }
  TypeChecker.prototype.check = function (req, res, next) {
    var obj = req.body
    if (!obj || obj === "") {
      res.status(400).end("The request body cannot be empty")
    } else {
      var errors = resources.check(obj, this.attributes, this.allowUndefined)
      if (errors.length > 0) {
        res.status(400).json(errors).end()
      } else {
        next()
      }
    }
  }
  return TypeChecker
})()
exports.TypeChecker = TypeChecker
function check(attributes, allowUndefined) {
  var x = new TypeChecker(attributes, allowUndefined)
  return x.check
}
exports.check = check
function loadTemplates(ok, buildTemplates, correct, files) {
  if (!ok) {
    return undefined
  }
  if (!files) {
    files = ["./src/query.xml"]
  }
  var mappers = []
  for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
    var file = files_1[_i]
    var mapper = fs.readFileSync(file, "utf8")
    mappers.push(mapper)
  }
  return buildTemplates(mappers, correct)
}
exports.loadTemplates = loadTemplates
function start(a, s) {
  process.on("uncaughtException", function (err) {
    console.log(err)
  })
  if (s.https) {
    if (s.options) {
      https.createServer(s.options, a).listen(s.port, function () {
        console.log("Use https and start server at port " + s.port)
      })
    } else if (s.key && s.cert && s.key.length > 0 && s.cert.length > 0) {
      var options = {
        key: fs.readFileSync(s.key),
        cert: fs.readFileSync(s.cert),
      }
      https.createServer(options, a).listen(s.port, function () {
        console.log("Use https and start server at port " + s.port)
      })
    } else {
      http.createServer(a).listen(s.port, function () {
        console.log("Start server at port " + s.port)
      })
    }
  } else {
    http.createServer(a).listen(s.port, function () {
      console.log("Start server at port " + s.port)
    })
  }
}
exports.start = start
