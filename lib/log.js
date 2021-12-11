"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
function createConfig(c) {
  if (!c) {
    return { skips: [], duration: 'duration', request: '', response: '', status: '', size: '' };
  }
  var l = {
    log: c.log,
    separate: c.separate,
    skips: c.skips ? c.skips.split(',') : [],
    duration: c.duration ? c.duration : 'duration',
    request: c.request ? c.request : '',
    response: c.response ? c.response : '',
    status: c.status ? c.status : '',
    size: c.size ? c.size : ''
  };
  return l;
}
exports.createConfig = createConfig;
function skip(skips, url) {
  if (skips.length === 0) {
    return false;
  }
  var u = removeUrlParams(url);
  for (var _i = 0, skips_1 = skips; _i < skips_1.length; _i++) {
    var s = skips_1[_i];
    if (u.endsWith(s)) {
      return true;
    }
  }
  return false;
}
exports.skip = skip;
function removeUrlParams(url) {
  var startParams = url.indexOf('?');
  return startParams !== -1 ? url.substring(0, startParams) : url;
}
exports.removeUrlParams = removeUrlParams;
var Logger = (function () {
  function Logger(write, conf, build) {
    this.write = write;
    this.build = build;
    this.log = this.log.bind(this);
    this.c = createConfig(conf);
  }
  Logger.prototype.log = function (req, res, next) {
    var _this = this;
    if (this.c.log && !skip(this.c.skips, req.originalUrl)) {
      var start_1 = process.hrtime();
      var m = req.method;
      var x = this.c.request;
      var r_1 = false;
      if (m !== 'GET' && m !== 'DELETE') {
        r_1 = true;
      }
      var msg_1 = m + " " + req.originalUrl;
      if (this.c.separate && r_1) {
        if (this.c.request.length > 0) {
          var op = {};
          op[x] = JSON.stringify(req.body);
          if (this.build) {
            var op2 = this.build(req, op);
            this.write(msg_1, op2);
          }
          else {
            this.write(msg_1, op);
          }
        }
      }
      var chunks_1 = [];
      mapResponseBody(res, chunks_1);
      res.on('finish', function () {
        var duration = getDurationInMilliseconds(start_1);
        var op = {};
        op[_this.c.duration] = duration;
        if (r_1 && !_this.c.separate && _this.c.request.length > 0) {
          op[_this.c.request] = JSON.stringify(req.body);
        }
        if (_this.c.response.length > 0) {
          var rsBody = Buffer.concat(chunks_1).toString();
          op[_this.c.response] = rsBody;
        }
        if (_this.c.status.length > 0) {
          op[_this.c.status] = res.statusCode;
        }
        if (_this.c.size.length > 0) {
          if ('_contentLength' in res) {
            op[_this.c.size] = res['_contentLength'];
          }
          else if (res.hasHeader('content-length')) {
            var l = res.getHeader('content-length');
            if (typeof l === 'number' || typeof l === 'string') {
              op[_this.c.size] = l;
            }
          }
        }
        if (_this.build) {
          var op2 = _this.build(req, op);
          _this.write(msg_1, op2);
        }
        else {
          _this.write(msg_1, op);
        }
      });
      next();
    }
    else {
      next();
    }
  };
  return Logger;
}());
exports.Logger = Logger;
var mapResponseBody = function (res, chunks) {
  var defaultWrite = res.write.bind(res);
  var defaultEnd = res.end.bind(res);
  var ps = new stream_1.PassThrough();
  ps.on('data', function (data) { return chunks.push(data); });
  res.write = function () {
    var _a;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    (_a = ps).write.apply(_a, args);
    defaultWrite.apply(void 0, args);
  };
  res.end = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    ps.end.apply(ps, args);
    defaultEnd.apply(void 0, args);
  };
};
var NS_PER_SEC = 1e9;
var NS_TO_MS = 1e6;
var getDurationInMilliseconds = function (start) {
  var diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};
