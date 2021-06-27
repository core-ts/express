"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function buildId(req, attrs) {
  if (!attrs) {
    var id = req.params['id'];
    if (id && id.length > 0) {
      return id;
    }
    return null;
  }
  if (attrs && attrs.length === 1) {
    var key = (attrs[0].name ? attrs[0].name : 'id');
    var id = req.params[key];
    if (id && id.length > 0) {
      if (attrs[0].type === 'integer' || attrs[0].type === 'number') {
        if (isNaN(id)) {
          return null;
        }
        var v = parseFloat(id);
        return v;
      }
      return id;
    }
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
function buildKeys(attrs) {
  if (!attrs) {
    return undefined;
  }
  var keys = Object.keys(attrs);
  var ats = [];
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
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
