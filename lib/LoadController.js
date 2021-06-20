"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function buildId(req, attrs) {
  var key = 'id';
  if (attrs && attrs.length === 1) {
    var id = req.params[key];
    if (id && id.length > 0) {
      return id;
    }
    key = (attrs[0].name ? attrs[0].name : 'id');
  }
  if (!attrs || attrs.length <= 1) {
    var id = req.params[key];
    if (!id || id.length === 0) {
      return null;
    }
    return id;
  }
  var ids = {};
  for (var _i = 0, attrs_1 = attrs; _i < attrs_1.length; _i++) {
    var attr = attrs_1[_i];
    var v = req.params[attr.name];
    if (!v) {
      return null;
    }
    if (attr.type === 'integer' || attr.type === 'number') {
      if (isNaN(v)) {
        return null;
      }
      ids[attr.name] = parseFloat(v);
    }
    else {
      ids[attr.name] = v;
    }
    return ids;
  }
}
exports.buildId = buildId;
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
      return buildKeys(keys);
    }
  }
  if (typeof viewService !== 'function' && viewService.metadata) {
    var metadata = viewService.metadata();
    if (metadata) {
      return buildKeys(metadata.attributes);
    }
  }
  return undefined;
}
function buildKeys(attrs) {
  if (!attrs) {
    return undefined;
  }
  var keys = Object.keys(attrs);
  var ats = [];
  for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
    var key = keys_2[_i];
    var attr = attrs[key];
    if (attr) {
      if (attr.key === true) {
        var at = { name: key, type: attr.type };
        ats.push(at);
      }
    }
  }
  return ats;
}
exports.buildKeys = buildKeys;
var LoadController = (function () {
  function LoadController(log, viewService, keys) {
    this.log = log;
    this.load = this.load.bind(this);
    this.view = getViewFunc(viewService);
    this.keys = getKeysFunc(viewService, keys);
  }
  LoadController.prototype.load = function (req, res) {
    var _this = this;
    var id = buildId(req, this.keys);
    if (!id) {
      return res.status(400).end('Invalid parameters');
    }
    this.view(id).then(function (obj) {
      if (obj) {
        res.status(200).json(obj);
      }
      else {
        res.status(404).json(null);
      }
    }).catch(function (err) {
      if (_this.log) {
        _this.log(err);
      }
      res.status(500).send('Internal Server Error');
    });
  };
  return LoadController;
}());
exports.LoadController = LoadController;
