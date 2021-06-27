"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function jsonResult(res, result, quick, fields, config) {
  if (quick && fields && fields.length > 0) {
    res.status(200).json(toCsv(fields, result));
  }
  else {
    res.status(200).json(buildResult(result, config));
  }
}
exports.jsonResult = jsonResult;
function buildResult(r, conf) {
  if (!conf) {
    return r;
  }
  var x = {};
  x[conf.list] = r.list;
  x[conf.total] = r.total;
  if (r.last) {
    x[conf.last] = r.last;
  }
  return x;
}
exports.buildResult = buildResult;
function initializeConfig(conf) {
  if (!conf) {
    return undefined;
  }
  var c = {
    list: conf.list,
    total: conf.total,
    token: conf.token,
    last: conf.last,
    quick: conf.csv
  };
  if (!c.list || c.list.length === 0) {
    c.list = 'list';
  }
  if (!c.total || c.total.length === 0) {
    c.list = 'total';
  }
  if (!c.last || c.last.length === 0) {
    c.last = 'last';
  }
  return c;
}
exports.initializeConfig = initializeConfig;
function fromRequest(req, format) {
  var s = (req.method === 'GET' ? fromUrl(req, format) : fromBody(req, format));
  return s;
}
exports.fromRequest = fromRequest;
function fromBody(req, format) {
  var s = req.body;
  if (!format) {
    return s;
  }
  return format(s);
}
exports.fromBody = fromBody;
function fromUrl(req, format) {
  var s = {};
  var obj = req.query;
  var keys = Object.keys(obj);
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
    if (key === 'fields') {
      var x = obj[key].split(',');
      s[key] = x;
    }
    else {
      s[key] = obj[key];
    }
  }
  if (format) {
    format(s);
  }
  return s;
}
exports.fromUrl = fromUrl;
function getLimit(obj) {
  var refId = obj['refId'];
  if (!refId) {
    refId = obj['nextPageToken'];
  }
  var pageSize = obj['limit'];
  if (!pageSize) {
    pageSize = obj['pageSize'];
  }
  if (pageSize && !isNaN(pageSize)) {
    var ipageSize = Math.floor(parseFloat(pageSize));
    if (ipageSize > 0) {
      var skip = obj['skip'];
      if (skip && !isNaN(skip)) {
        var iskip = Math.floor(parseFloat(skip));
        if (iskip >= 0) {
          deletePageInfo(obj);
          return { limit: ipageSize, skip: iskip };
        }
      }
      var pageIndex = obj['page'];
      if (!pageIndex) {
        pageIndex = obj['pageIndex'];
        if (!pageIndex) {
          pageIndex = obj['pageNo'];
        }
      }
      if (pageIndex && !isNaN(pageIndex)) {
        var ipageIndex = Math.floor(parseFloat(pageIndex));
        if (ipageIndex < 1) {
          ipageIndex = 1;
        }
        var firstPageSize = obj['firstLimit'];
        if (!firstPageSize) {
          firstPageSize = obj['firstPageSize'];
        }
        if (!firstPageSize) {
          firstPageSize = obj['initPageSize'];
        }
        if (firstPageSize && !isNaN(firstPageSize)) {
          var ifirstPageSize = Math.floor(parseFloat(firstPageSize));
          if (ifirstPageSize > 0) {
            deletePageInfo(obj);
            return { limit: ipageSize, skip: ipageSize * (ipageIndex - 2) + ifirstPageSize };
          }
        }
        deletePageInfo(obj);
        return { limit: ipageSize, skip: ipageSize * (ipageIndex - 1) };
      }
      deletePageInfo(obj);
      return { limit: ipageSize, skip: 0, refId: refId };
    }
  }
  return { limit: undefined, skip: undefined, refId: refId };
}
exports.getLimit = getLimit;
function deletePageInfo(obj) {
  delete obj['limit'];
  delete obj['firstLimit'];
  delete obj['skip'];
  delete obj['page'];
  delete obj['pageNo'];
  delete obj['pageIndex'];
  delete obj['pageSize'];
  delete obj['initPageSize'];
  delete obj['firstPageSize'];
  delete obj['refId'];
  delete obj['refId'];
  delete obj['nextPageToken'];
}
exports.deletePageInfo = deletePageInfo;
var re = /"/g;
function toCsv(fields, r) {
  if (!r || r.list.length === 0) {
    return '0';
  }
  else {
    var e = '';
    var s = 'string';
    var n = 'number';
    var b = '""';
    var rows = [];
    rows.push('' + r.total + ',' + (r.last ? '1' : ''));
    for (var _i = 0, _a = r.list; _i < _a.length; _i++) {
      var item = _a[_i];
      var cols = [];
      for (var _b = 0, fields_1 = fields; _b < fields_1.length; _b++) {
        var name = fields_1[_b];
        var v = item[name];
        if (!v) {
          cols.push(e);
        }
        else {
          if (typeof v === s) {
            if (s.indexOf(',') >= 0) {
              cols.push('"' + v.replace(re, b) + '"');
            }
            else {
              cols.push(v);
            }
          }
          else if (v instanceof Date) {
            cols.push(v.toISOString());
          }
          else if (typeof v === n) {
            cols.push(v.toString());
          }
          else {
            cols.push('');
          }
        }
      }
      rows.push(cols.join(','));
    }
    return rows.join('\n');
  }
}
exports.toCsv = toCsv;
