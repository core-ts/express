"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("./http");
var view_1 = require("./view");
function getViewFunc(viewService) {
  if (typeof viewService === 'function') {
    return viewService;
  }
  return viewService.load;
}
function getKeysFunc(viewService, keys) {
  if (keys) {
    if (Array.isArray(keys)) {
      if (keys.length > 0) {
        if (typeof keys[0] === 'string') {
          return http_1.attrs(keys);
        }
        else {
          return keys;
        }
      }
      return undefined;
    }
    else {
      return view_1.buildKeys(keys);
    }
  }
  if (typeof viewService !== 'function' && viewService.metadata) {
    var metadata = viewService.metadata();
    if (metadata) {
      return view_1.buildKeys(metadata);
    }
  }
  return undefined;
}
var LoadController = (function () {
  function LoadController(log, viewService, keys) {
    this.log = log;
    this.load = this.load.bind(this);
    this.view = getViewFunc(viewService);
    this.keys = getKeysFunc(viewService, keys);
  }
  LoadController.prototype.load = function (req, res) {
    var _this = this;
    var id = view_1.buildAndCheckId(req, res, this.keys);
    if (id) {
      this.view(id)
        .then(function (obj) { return http_1.respondModel(http_1.minimize(obj), res); })
        .catch(function (err) { return http_1.handleError(err, res, _this.log); });
    }
  };
  return LoadController;
}());
exports.LoadController = LoadController;
