"use strict";
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var GenericController_1 = require("./GenericController");
exports.GenericHandler = GenericController_1.GenericController;
var GenericSearchController_1 = require("./GenericSearchController");
exports.GenericSearchHandler = GenericSearchController_1.GenericSearchController;
var HealthController_1 = require("./HealthController");
exports.HealthHandler = HealthController_1.HealthController;
var LoadController_1 = require("./LoadController");
exports.LoadHandler = LoadController_1.LoadController;
exports.ViewHandler = LoadController_1.LoadController;
var LoadSearchController_1 = require("./LoadSearchController");
exports.LoadSearchHandler = LoadSearchController_1.LoadSearchController;
var LogController_1 = require("./LogController");
exports.LogHandler = LogController_1.LogController;
var LowCodeController_1 = require("./LowCodeController");
exports.LowCodeHandler = LowCodeController_1.Controller;
exports.LowCodeController = LowCodeController_1.Controller;
var SearchController_1 = require("./SearchController");
exports.SearchHandler = SearchController_1.SearchController;
__export(require("./health"));
__export(require("./client"));
__export(require("./HealthController"));
__export(require("./LogController"));
__export(require("./log"));
__export(require("./http"));
__export(require("./view"));
__export(require("./LoadController"));
__export(require("./search_func"));
__export(require("./search"));
__export(require("./SearchController"));
__export(require("./LoadSearchController"));
__export(require("./resources"));
__export(require("./edit"));
__export(require("./GenericController"));
__export(require("./GenericSearchController"));
__export(require("./LowCodeController"));
function allow(access) {
  var ao = access.origin;
  if (typeof ao === 'string') {
    return function (req, res, next) {
      res.header('Access-Control-Allow-Origin', access.origin);
      res.header('Access-Control-Allow-Credentials', access.credentials);
      res.header('Access-Control-Allow-Methods', access.methods);
      res.setHeader('Access-Control-Allow-Headers', access.headers);
      next();
    };
  }
  else if (Array.isArray(ao) && ao.length > 0) {
    return function (req, res, next) {
      var origin = req.headers.origin;
      if (origin) {
        if (ao.includes(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
        }
      }
      res.header('Access-Control-Allow-Credentials', access.credentials);
      res.header('Access-Control-Allow-Methods', access.methods);
      res.setHeader('Access-Control-Allow-Headers', access.headers);
      next();
    };
  }
  return function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', access.credentials);
    res.header('Access-Control-Allow-Methods', access.methods);
    res.setHeader('Access-Control-Allow-Headers', access.headers);
    next();
  };
}
exports.allow = allow;
