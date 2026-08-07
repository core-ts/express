"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var LogController = (function () {
  function LogController(logger, updateLogger, map) {
    this.logger = logger
    this.updateLogger = updateLogger
    this.map = map
    this.config = this.config.bind(this)
  }
  LogController.prototype.config = function (req, res) {
    var obj = req.body
    if (!this.logger) {
      res.status(503).end("Logger is not available")
      return
    }
    if (typeof obj.level === "string" && obj.level.length > 0) {
      if (!this.map) {
        res.status(503).end("Map is not available")
        return
      }
    }
    var changed = this.updateLogger(this.logger, obj, this.map)
    if (changed) {
      res.writeHead(200).end("true")
    } else {
      res.writeHead(204).end("false")
    }
  }
  return LogController
})()
exports.LogController = LogController
exports.LogHandler = LogController
