"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = {
  TRACE: -2,
  DEBUG: -1,
  INFO: 0,
  WARN: 1,
  ERROR: 2,
  PANIC: 3,
  FATAL: 4
};
var LogController = (function () {
  function LogController(logger, mp) {
    this.logger = logger;
    this.map = (mp ? mp : exports.map);
    this.config = this.config.bind(this);
  }
  LogController.prototype.config = function (req, res) {
    var obj = req.body;
    if (!obj || obj === '') {
      return res.status(400).end('The request body cannot be empty');
    }
    if (!this.logger) {
      return res.status(503).end('Logger is not available');
    }
    var changed = false;
    if (typeof obj.level === 'string' && obj.level.length > 0) {
      if (!this.map) {
        return res.status(503).end('Map is not available');
      }
      var lv = this.map[obj.level.toUpperCase()];
      if (lv !== undefined) {
        this.logger.level = lv;
        changed = true;
      }
    }
    if (obj.map) {
      if (typeof obj.map.level === 'string' && obj.map.level.length > 0) {
        this.logger.map.level = obj.map.level;
        changed = true;
      }
      if (typeof obj.map.time === 'string' && obj.map.time.length > 0) {
        this.logger.map.time = obj.map.time;
        changed = true;
      }
      if (typeof obj.map.msg === 'string' && obj.map.msg.length > 0) {
        this.logger.map.msg = obj.map.msg;
        changed = true;
      }
    }
    if (obj.constants !== undefined && typeof obj.constants === 'object') {
      this.logger.constants = obj.constants;
      changed = true;
    }
    if (obj.name) {
      if (typeof obj.name.trace === 'string'
        && typeof obj.name.debug === 'string'
        && typeof obj.name.info === 'string'
        && typeof obj.name.warn === 'string'
        && typeof obj.name.error === 'string'
        && typeof obj.name.panic === 'string'
        && typeof obj.name.fatal === 'string') {
        this.logger.name = obj.name;
        changed = true;
      }
    }
    if (changed) {
      return res.status(200).end('true');
    }
    else {
      return res.status(204).end('false');
    }
  };
  return LogController;
}());
exports.LogController = LogController;
