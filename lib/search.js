"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = exports.buildMetadata = exports.toCsv = exports.deletePageInfo = exports.getParameters = exports.setValue = exports.fromUrl = exports.fromRequest = exports.initializeConfig = exports.buildResult = exports.jsonResult = void 0;
function jsonResult(res, result, quick, fields, config) {
  if (quick && fields && fields.length > 0) {
    res.status(200).json(toCsv(fields, result)).end();
  }
  else {
    res.status(200).json(buildResult(result, config)).end();
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
  if (r.nextPageToken && r.nextPageToken.length > 0) {
    x[conf.token] = r.nextPageToken;
  }
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
    excluding: conf.excluding,
    fields: conf.fields,
    list: conf.list,
    total: conf.total,
    token: conf.token,
    last: conf.last,
    csv: conf.csv,
    page: conf.page,
    limit: conf.limit,
    skip: conf.skip,
    refId: conf.refId,
    firstLimit: conf.firstLimit
  };
  if (!c.excluding || c.excluding.length === 0) {
    c.excluding = 'excluding';
  }
  if (!c.fields || c.fields.length === 0) {
    c.fields = 'fields';
  }
  if (!c.list || c.list.length === 0) {
    c.list = 'list';
  }
  if (!c.total || c.total.length === 0) {
    c.total = 'total';
  }
  if (!c.last || c.last.length === 0) {
    c.last = 'last';
  }
  if (!c.token || c.token.length === 0) {
    c.token = 'nextPageToken';
  }
  if (!c.page || c.page.length === 0) {
    c.page = 'page';
  }
  if (!c.limit || c.limit.length === 0) {
    c.limit = 'limit';
  }
  if (!c.skip || c.skip.length === 0) {
    c.skip = 'skip';
  }
  if (!c.refId || c.refId.length === 0) {
    c.refId = 'refId';
  }
  if (!c.firstLimit || c.firstLimit.length === 0) {
    c.firstLimit = 'firstLimit';
  }
  return c;
}
exports.initializeConfig = initializeConfig;
function fromRequest(req, fields, excluding) {
  var s = (req.method === 'GET' ? fromUrl(req, fields, excluding) : req.body);
  return s;
}
exports.fromRequest = fromRequest;
function fromUrl(req, fields, excluding) {
  if (!fields || fields.length === 0) {
    fields = 'fields';
  }
  var s = {};
  var obj = req.query;
  var keys = Object.keys(obj);
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
    if (key === fields) {
      var x = obj[key].split(',');
      s[key] = x;
    }
    else if (key === excluding) {
      var x = obj[key].split(',');
      s[key] = x;
    }
    else {
      setValue(s, key, obj[key]);
    }
  }
  return s;
}
exports.fromUrl = fromUrl;
function setValue(obj, path, value) {
  var paths = path.split('.');
  if (paths.length === 1) {
    obj[path] = value;
  }
  else {
    var o = obj;
    var l = paths.length - 1;
    for (var i = 0; i < l - 1; i++) {
      var p = paths[i];
      if (p in o) {
        o = o[p];
      }
      else {
        o[p] = {};
        o = o[p];
      }
    }
    o[paths[paths.length - 1]] = value;
  }
}
exports.setValue = setValue;
function getParameters(obj, config) {
  if (!config) {
    var sfield = 'fields';
    var fields = void 0;
    var fs = obj[sfield];
    if (fs && Array.isArray(fs)) {
      fields = fs;
      delete obj[sfield];
    }
    var refId = obj['refId'];
    if (!refId) {
      refId = obj['nextPageToken'];
    }
    var r = { fields: fields, refId: refId };
    var pageSize = obj['limit'];
    if (!pageSize) {
      pageSize = obj['pageSize'];
    }
    if (pageSize && !isNaN(pageSize)) {
      var ipageSize = Math.floor(parseFloat(pageSize));
      if (ipageSize > 0) {
        r.limit = ipageSize;
        var skip = obj['skip'];
        if (skip && !isNaN(skip)) {
          var iskip = Math.floor(parseFloat(skip));
          if (iskip >= 0) {
            r.skip = iskip;
            r.skipOrRefId = r.skip;
            deletePageInfo(obj);
            return r;
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
              r.skip = ipageSize * (ipageIndex - 2) + ifirstPageSize;
              r.skipOrRefId = r.skip;
              deletePageInfo(obj);
              return r;
            }
          }
          r.skip = ipageSize * (ipageIndex - 1);
          r.skipOrRefId = r.skip;
          deletePageInfo(obj);
          return r;
        }
        r.skip = 0;
        if (r.refId && r.refId.length > 0) {
          r.skipOrRefId = r.refId;
        }
        deletePageInfo(obj);
        return r;
      }
    }
    if (r.refId && r.refId.length > 0) {
      r.skipOrRefId = r.refId;
    }
    deletePageInfo(obj);
    return r;
  }
  else {
    var sfield = config.fields;
    if (!sfield || sfield.length === 0) {
      sfield = 'fields';
    }
    var fields = void 0;
    var fs = obj[sfield];
    if (fs && Array.isArray(fs)) {
      fields = fs;
      delete obj[sfield];
    }
    var strRefId = config.refId;
    if (!strRefId || strRefId.length === 0) {
      strRefId = 'refId';
    }
    var refId = obj[strRefId];
    var r = { fields: fields, refId: refId };
    var strLimit = config.limit;
    if (!strLimit || strLimit.length === 0) {
      strLimit = 'limit';
    }
    var pageSize = obj[strLimit];
    var arr = [config.page, config.limit, config.skip, config.refId, config.firstLimit];
    if (pageSize && !isNaN(pageSize)) {
      var ipageSize = Math.floor(parseFloat(pageSize));
      if (ipageSize > 0) {
        r.limit = ipageSize;
        var strSkip = config.skip;
        if (!strSkip || strSkip.length === 0) {
          strSkip = 'skip';
        }
        var skip = obj[strSkip];
        if (skip && !isNaN(skip)) {
          var iskip = Math.floor(parseFloat(skip));
          if (iskip >= 0) {
            r.skip = iskip;
            r.skipOrRefId = r.skip;
            deletePageInfo(obj, arr);
            return r;
          }
        }
        var strPage = config.page;
        if (!strPage || strPage.length === 0) {
          strPage = 'page';
        }
        var pageIndex = obj[strPage];
        if (pageIndex && !isNaN(pageIndex)) {
          var ipageIndex = Math.floor(parseFloat(pageIndex));
          if (ipageIndex < 1) {
            ipageIndex = 1;
          }
          var strFirstLimit = config.firstLimit;
          if (!strFirstLimit || strFirstLimit.length === 0) {
            strFirstLimit = 'firstLimit';
          }
          var firstPageSize = obj[strFirstLimit];
          if (firstPageSize && !isNaN(firstPageSize)) {
            var ifirstPageSize = Math.floor(parseFloat(firstPageSize));
            if (ifirstPageSize > 0) {
              r.skip = ipageSize * (ipageIndex - 2) + ifirstPageSize;
              r.skipOrRefId = r.skip;
              deletePageInfo(obj, arr);
              return r;
            }
          }
          r.skip = ipageSize * (ipageIndex - 1);
          r.skipOrRefId = r.skip;
          deletePageInfo(obj, arr);
          return r;
        }
        r.skip = 0;
        if (r.refId && r.refId.length > 0) {
          r.skipOrRefId = r.refId;
        }
        deletePageInfo(obj, arr);
        return r;
      }
    }
    if (r.refId && r.refId.length > 0) {
      r.skipOrRefId = r.refId;
    }
    deletePageInfo(obj, arr);
    return r;
  }
}
exports.getParameters = getParameters;
function deletePageInfo(obj, arr) {
  if (!arr || arr.length === 0) {
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
    delete obj['nextPageToken'];
  }
  else {
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
      var o = arr_1[_i];
      if (o && o.length > 0) {
        delete obj[o];
      }
    }
  }
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
    rows.push('' + (r.total ? r.total : '') + ',' + (r.nextPageToken ? r.nextPageToken : '') + ',' + (r.last ? '1' : ''));
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
function buildMetadata(attributes, includeDate) {
  var keys = Object.keys(attributes);
  var dates = [];
  var numbers = [];
  for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
    var key = keys_2[_i];
    var attr = attributes[key];
    if (attr.type === 'number' || attr.type === 'integer') {
      numbers.push(key);
    }
    else if (attr.type === 'datetime' || (includeDate === true && attr.type === 'date')) {
      dates.push(key);
    }
  }
  var m = {};
  if (dates.length > 0) {
    m.dates = dates;
  }
  if (numbers.length > 0) {
    m.numbers = numbers;
  }
  return m;
}
exports.buildMetadata = buildMetadata;
var _datereg = '/Date(';
var _re = /-?\d+/;
function toDate(v) {
  if (!v || v === '') {
    return null;
  }
  if (v instanceof Date) {
    return v;
  }
  else if (typeof v === 'number') {
    return new Date(v);
  }
  var i = v.indexOf(_datereg);
  if (i >= 0) {
    var m = _re.exec(v);
    var d = parseInt(m[0], null);
    return new Date(d);
  }
  else {
    if (isNaN(v)) {
      return new Date(v);
    }
    else {
      var d = parseInt(v, null);
      return new Date(d);
    }
  }
}
function format(obj, dates, nums) {
  if (dates && dates.length > 0) {
    for (var _i = 0, dates_1 = dates; _i < dates_1.length; _i++) {
      var s = dates_1[_i];
      var v = obj[s];
      if (v) {
        if (v instanceof Date) {
          continue;
        }
        if (typeof v === 'string' || typeof v === 'number') {
          var d = toDate(v);
          var error = d.toString();
          if (!(d instanceof Date) || error === 'Invalid Date') {
            delete obj[s];
          }
          else {
            obj[s] = d;
          }
        }
        else if (typeof v === 'object') {
          var keys = Object.keys(v);
          for (var _a = 0, keys_3 = keys; _a < keys_3.length; _a++) {
            var key = keys_3[_a];
            var v2 = v[key];
            if (v2 instanceof Date) {
              continue;
            }
            if (typeof v2 === 'string' || typeof v2 === 'number') {
              var d2 = toDate(v2);
              var error2 = d2.toString();
              if (!(d2 instanceof Date) || error2 === 'Invalid Date') {
                delete v[key];
              }
              else {
                v[key] = d2;
              }
            }
          }
        }
      }
    }
  }
  if (nums && nums.length > 0) {
    for (var _b = 0, nums_1 = nums; _b < nums_1.length; _b++) {
      var s = nums_1[_b];
      var v = obj[s];
      if (v) {
        if (v instanceof Date) {
          delete obj[s];
          continue;
        }
        if (typeof v === 'number') {
          continue;
        }
        if (typeof v === 'string') {
          if (!isNaN(v)) {
            delete obj[s];
            continue;
          }
          else {
            var i = parseFloat(v);
            obj[s] = i;
          }
        }
        else if (typeof v === 'object') {
          var keys = Object.keys(v);
          for (var _c = 0, keys_4 = keys; _c < keys_4.length; _c++) {
            var key = keys_4[_c];
            var v2 = v[key];
            if (v2 instanceof Date) {
              delete obj[key];
              continue;
            }
            if (typeof v2 === 'number') {
              continue;
            }
            if (typeof v2 === 'string') {
              if (!isNaN(v2)) {
                delete v[key];
              }
              else {
                var i = parseFloat(v2);
                v[key] = i;
              }
            }
          }
        }
      }
    }
  }
  return obj;
}
exports.format = format;
