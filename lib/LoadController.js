"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var response_1 = require("./response");
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
          var attrs = [];
          for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var str = keys_1[_i];
            var attr = { name: str, type: 'string' };
            attrs.push(attr);
          }
          return attrs;
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
      return view_1.buildKeys(metadata.attributes);
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
    var id = view_1.buildId(req, this.keys);
    if (!id) {
      return res.status(400).end('invalid parameters');
    }
    this.view(id).then(function (obj) {
      if (obj) {
        res.status(200).json(obj);
      }
      else {
        res.status(404).json(null);
      }
    }).catch(function (err) { return response_1.handleError(err, res, _this.log); });
  };
  return LoadController;
}());
exports.LoadController = LoadController;
