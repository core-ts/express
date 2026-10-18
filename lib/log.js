"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var stream_1 = require("stream")
var resources_1 = require("./resources")
function createConfig(cfg) {
  if (!cfg) {
    return { skips: [], duration: "duration", request: "", response: "", status: "", size: "" }
  }
  var tempSkips = cfg.skips ? cfg.skips.split(",") : []
  var skips = []
  for (var _i = 0, tempSkips_1 = tempSkips; _i < tempSkips_1.length; _i++) {
    var s = tempSkips_1[_i]
    var sf = s.startsWith("/") ? s : "/" + s
    skips.push(sf)
  }
  var l = {
    log: cfg.log,
    separate: cfg.separate,
    skips: skips,
    duration: cfg.duration ? cfg.duration : "duration",
    request: cfg.request ? cfg.request : "",
    response: cfg.response ? cfg.response : "",
    status: cfg.status ? cfg.status : "",
    size: cfg.size ? cfg.size : "",
  }
  return l
}
exports.createConfig = createConfig
var o = "OPTIONS"
var MiddlewareLogger = (function () {
  function MiddlewareLogger(write, config, buildContext, encryptResponse, encryptRequest) {
    if (encryptRequest === void 0) {
      encryptRequest = JSON.stringify
    }
    this.write = write
    this.buildContext = buildContext
    this.encryptResponse = encryptResponse
    this.encryptRequest = encryptRequest
    this.log = this.log.bind(this)
    this.config = createConfig(config)
  }
  MiddlewareLogger.prototype.log = function (req, res, next) {
    var _this = this
    var mt = req.method
    if (mt !== o && this.config.log && !req.is("multipart/form-data") && !this.config.skips.includes(req.path)) {
      var start_1 = process.hrtime()
      var rq_1 = this.config.request
      var r_1 = false
      if (mt !== "GET" && mt !== "DELETE") {
        r_1 = true
      }
      var msg_1 = mt + " " + req.originalUrl
      if (this.config.separate && r_1) {
        if (this.config.request.length > 0) {
          var op = {}
          op[rq_1] = this.encryptRequest(req.body)
          if (this.buildContext) {
            var op2 = this.buildContext(req, op)
            this.write(msg_1, op2)
          } else {
            this.write(msg_1, op)
          }
        }
      }
      var chunks_1 = []
      mapResponseBody(res, chunks_1)
      res.on("finish", function () {
        var duration = getDurationInMilliseconds(start_1)
        var op = {}
        if (r_1 && !_this.config.separate && _this.config.request.length > 0) {
          op[rq_1] = _this.encryptRequest(req.body)
        }
        if (_this.config.response.length > 0) {
          var rsBody = Buffer.concat(chunks_1).toString(resources_1.resources.encoding)
          if (_this.encryptResponse) {
            op[_this.config.response] = _this.encryptResponse(rsBody)
          } else {
            op[_this.config.response] = rsBody
          }
        }
        if (_this.config.status.length > 0) {
          op[_this.config.status] = res.statusCode
        }
        if (_this.config.size.length > 0) {
          if ("_contentLength" in res) {
            op[_this.config.size] = res["_contentLength"]
          } else if (res.hasHeader("content-length")) {
            var lg = res.getHeader("content-length")
            if (typeof lg === "number" || typeof lg === "string") {
              op[_this.config.size] = lg
            }
          }
        }
        op[_this.config.duration] = duration
        if (_this.buildContext) {
          var op2 = _this.buildContext(req, op)
          _this.write(msg_1, op2)
        } else {
          _this.write(msg_1, op)
        }
      })
      next()
    } else {
      next()
    }
  }
  return MiddlewareLogger
})()
exports.MiddlewareLogger = MiddlewareLogger
var mapResponseBody = function (res, chunks) {
  var defaultWrite = res.write.bind(res)
  var defaultEnd = res.end.bind(res)
  var ps = new stream_1.PassThrough()
  ps.on("data", function (data) {
    return chunks.push(data)
  })
  res.write = function () {
    var _a
    var args = []
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i]
    }
    ;(_a = ps).write.apply(_a, args)
    defaultWrite.apply(void 0, args)
  }
  res.end = function () {
    var args = []
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i]
    }
    ps.end.apply(ps, args)
    defaultEnd.apply(void 0, args)
  }
}
var NS_PER_SEC = 1e9
var NS_TO_MS = 1e6
var getDurationInMilliseconds = function (start) {
  var diff = process.hrtime(start)
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}
var MiddlewareController = (function () {
  function MiddlewareController(logger) {
    this.logger = logger
    this.config = this.config.bind(this)
  }
  MiddlewareController.prototype.config = function (req, res) {
    var obj = req.body
    if (!this.logger) {
      res.status(503).end("Logger is not available")
      return
    }
    var changed = false
    if (obj.log !== undefined) {
      this.logger.config.log = obj.log
      changed = true
    }
    if (obj.separate !== undefined) {
      this.logger.config.separate = obj.separate
      changed = true
    }
    if (Array.isArray(obj.skips)) {
      if (isValidSkips(obj.skips)) {
        this.logger.config.skips = obj.skips
        changed = true
      }
    }
    if (typeof obj.duration === "string" && obj.duration.length > 0) {
      this.logger.config.duration = obj.duration
      changed = true
    }
    if (typeof obj.request === "string") {
      this.logger.config.request = obj.request
      changed = true
    }
    if (typeof obj.response === "string") {
      this.logger.config.response = obj.response
      changed = true
    }
    if (typeof obj.status === "string") {
      this.logger.config.status = obj.status
      changed = true
    }
    if (typeof obj.size === "string") {
      this.logger.config.size = obj.size
      changed = true
    }
    if (changed) {
      res.status(200).json(true).end()
    } else {
      res.status(204).json(false).end()
    }
  }
  return MiddlewareController
})()
exports.MiddlewareController = MiddlewareController
function isValidSkips(s) {
  for (var _i = 0, s_1 = s; _i < s_1.length; _i++) {
    var x = s_1[_i]
    if (!(typeof x === "string")) {
      return false
    }
  }
  return true
}
exports.isValidSkips = isValidSkips
function mask(s, start, end, replace) {
  if (start < 0) {
    start = 0
  }
  if (end < 0) {
    end = 0
  }
  var t = start + end
  if (t >= s.length) {
    return replace.repeat(s.length)
  }
  return s.substring(0, start) + replace.repeat(s.length - t) + s.substring(s.length - end)
}
exports.mask = mask
function margin(s, start, end, replace) {
  if (start >= end) {
    return ""
  }
  if (start < 0) {
    start = 0
  }
  if (end < 0) {
    end = 0
  }
  if (start >= s.length) {
    return replace.repeat(s.length)
  }
  if (end >= s.length) {
    return replace.repeat(start) + s.substring(start)
  }
  return replace.repeat(start) + s.substring(start, end - start) + replace.repeat(s.length - end)
}
exports.margin = margin
exports.maskMargin = margin
