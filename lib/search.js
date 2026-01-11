"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var http_1 = require("./http")
var resources_1 = require("./resources")
var et = ""
function getPage(req, filter) {
  if (filter) {
    var v0 = filter[resources_1.resources.page]
    if (v0 == undefined) {
      var field_1 = req.query[resources_1.resources.page]
      var v_1 = field_1 ? field_1.toString() : undefined
      if (!v_1 || v_1.length === 0) {
        filter[resources_1.resources.page] = 1
        return 1
      }
      if (isNaN(v_1)) {
        filter[resources_1.resources.page] = 1
        return 1
      } else {
        var n_1 = parseFloat(v_1)
        if (n_1 < 1) {
          n_1 = 1
        }
        filter[resources_1.resources.page] = n_1
        return n_1
      }
    } else if (typeof v0 === "number") {
      if (v0 > 0) {
        return v0
      } else {
        filter[resources_1.resources.page] = 1
        return 1
      }
    }
  }
  var field = req.query[resources_1.resources.page]
  var v = field ? field.toString() : undefined
  if (!v || v.length === 0) {
    if (filter) {
      filter[resources_1.resources.page] = 1
    }
    return 1
  }
  if (isNaN(v)) {
    if (filter) {
      filter[resources_1.resources.page] = 1
    }
    return 1
  }
  var n = parseFloat(v)
  if (n < 1) {
    n = 1
  }
  if (filter) {
    filter[resources_1.resources.page] = n
  }
  return n
}
exports.getPage = getPage
function getLimit(req, filter) {
  if (filter) {
    var v0 = filter[resources_1.resources.limit]
    if (v0 == undefined) {
      var field_2 = req.query[resources_1.resources.limit]
      var v_2 = field_2 ? field_2.toString() : undefined
      if (!v_2 || v_2.length === 0) {
        filter[resources_1.resources.limit] = resources_1.resources.defaultLimit
        return resources_1.resources.defaultLimit
      }
      if (isNaN(v_2)) {
        filter[resources_1.resources.limit] = resources_1.resources.defaultLimit
        return 1
      } else {
        var n_2 = parseFloat(v_2)
        if (n_2 < 1) {
          n_2 = resources_1.resources.defaultLimit
        }
        filter[resources_1.resources.limit] = n_2
        return n_2
      }
    } else if (typeof v0 === "number") {
      if (v0 > 0) {
        return v0
      } else {
        filter[resources_1.resources.limit] = resources_1.resources.defaultLimit
        return resources_1.resources.defaultLimit
      }
    }
  }
  var field = req.query[resources_1.resources.limit]
  var v = field ? field.toString() : undefined
  if (!v || v.length === 0) {
    if (filter) {
      filter[resources_1.resources.limit] = resources_1.resources.defaultLimit
    }
    return resources_1.resources.defaultLimit
  }
  if (isNaN(v)) {
    if (filter) {
      filter[resources_1.resources.limit] = resources_1.resources.defaultLimit
    }
    return resources_1.resources.defaultLimit
  }
  var n = parseFloat(v)
  if (n < 1) {
    n = resources_1.resources.defaultLimit
  }
  if (filter) {
    filter[resources_1.resources.limit] = n
  }
  return n
}
exports.getLimit = getLimit
function queryLimit(req) {
  return http_1.queryNumber(req, resources_1.resources.limit, resources_1.resources.defaultLimit)
}
exports.queryLimit = queryLimit
function queryPage(req, filter) {
  var field = req.query[resources_1.resources.page]
  var v = field ? field.toString() : undefined
  if (!v || v.length === 0) {
    filter[resources_1.resources.page] = 1
    return 1
  }
  if (isNaN(v)) {
    filter[resources_1.resources.page] = 1
    return 1
  }
  var n = parseFloat(v)
  filter[resources_1.resources.page] = n
  return n
}
exports.queryPage = queryPage
function getOffset(limit, page) {
  return !page || page <= 1 || limit <= 0 ? 0 : limit * (page - 1)
}
exports.getOffset = getOffset
function getPageTotal(pageSize, total) {
  if (!pageSize || pageSize <= 0) {
    return 1
  } else {
    if (!total) {
      total = 0
    }
    if (total % pageSize === 0) {
      return Math.floor(total / pageSize)
    }
    return Math.floor(total / pageSize + 1)
  }
}
exports.getPageTotal = getPageTotal
function formatText() {
  var args = []
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i]
  }
  var formatted = args[0]
  if (!formatted || formatted === "") {
    return ""
  }
  if (args.length > 1 && Array.isArray(args[1])) {
    var params = args[1]
    for (var i = 0; i < params.length; i++) {
      var regexp = new RegExp("\\{" + i + "\\}", "gi")
      formatted = formatted.replace(regexp, params[i])
    }
  } else {
    for (var i = 1; i < args.length; i++) {
      var regexp = new RegExp("\\{" + (i - 1) + "\\}", "gi")
      formatted = formatted.replace(regexp, args[i])
    }
  }
  return formatted
}
exports.formatText = formatText
function buildMessage(resource, results, limit, page, total) {
  if (!results || results.length === 0) {
    return resource.msg_no_data_found
  } else {
    if (!page) {
      page = 1
    }
    var fromIndex = (page - 1) * limit + 1
    var toIndex = fromIndex + results.length - 1
    var pageTotal = getPageTotal(limit, total)
    if (pageTotal > 1) {
      var msg2 = formatText(resource.msg_search_result_page_sequence, fromIndex, toIndex, total, page, pageTotal)
      return msg2
    } else {
      var msg3 = formatText(resource.msg_search_result_sequence, fromIndex, toIndex)
      return msg3
    }
  }
}
exports.buildMessage = buildMessage
function buildPages(pageSize, total) {
  var pageTotal = getPageTotal(pageSize, total)
  if (pageTotal <= 1) {
    return [1]
  }
  var arr = []
  for (var i = 1; i <= pageTotal; i++) {
    arr.push(i)
  }
  return arr
}
exports.buildPages = buildPages
function hasSearch(req) {
  return req.url.indexOf("?") >= 0
}
exports.hasSearch = hasSearch
function getSearch(url) {
  var i = url.indexOf("?")
  return i < 0 ? et : url.substring(i + 1)
}
exports.getSearch = getSearch
function getField(search, fieldName) {
  var i = search.indexOf(fieldName + "=")
  if (i < 0) {
    return ""
  }
  if (i > 0) {
    if (search.substring(i - 1, 1) != "&") {
      i = search.indexOf("&" + fieldName + "=")
      if (i < 0) {
        return search
      }
      i = i + 1
    }
  }
  var j = search.indexOf("&", i + fieldName.length)
  return j >= 0 ? search.substring(i, j) : search.substring(i)
}
exports.getField = getField
function removeField(search, fieldName) {
  var i = search.indexOf(fieldName + "=")
  if (i < 0) {
    return search
  }
  if (i > 0) {
    if (search.substring(i - 1, 1) != "&") {
      i = search.indexOf("&" + fieldName + "=")
      if (i < 0) {
        return search
      }
      i = i + 1
    }
  }
  var j = search.indexOf("&", i + fieldName.length)
  return j >= 0 ? search.substring(0, i) + search.substring(j + 1) : search.substring(0, i - 1)
}
exports.removeField = removeField
function removePage(search) {
  search = removeField(search, resources_1.resources.page)
  search = removeField(search, resources_1.resources.partial)
  return search
}
exports.removePage = removePage
function buildPageSearch(search) {
  var sr = removePage(search)
  return sr.length == 0 ? sr : "&" + sr
}
exports.buildPageSearch = buildPageSearch
function buildPageSearchFromUrl(url) {
  var search = getSearch(url)
  return buildPageSearch(search)
}
exports.buildPageSearchFromUrl = buildPageSearchFromUrl
function removeSort(search) {
  search = removeField(search, resources_1.resources.sort)
  search = removeField(search, resources_1.resources.partial)
  return search
}
exports.removeSort = removeSort
function getSortString(field, sort) {
  if (field === sort.field) {
    return sort.type === "-" ? field : "-" + field
  }
  return field
}
exports.getSortString = getSortString
function buildSort(s) {
  if (!s || s.indexOf(",") >= 0) {
    return {}
  }
  if (s.startsWith("-")) {
    return { field: s.substring(1), type: "-" }
  } else {
    return { field: s.startsWith("+") ? s.substring(1) : s, type: "+" }
  }
}
exports.buildSort = buildSort
function buildSortFromRequest(req) {
  var s = http_1.query(req, resources_1.resources.sort)
  return buildSort(s)
}
exports.buildSortFromRequest = buildSortFromRequest
function renderSort(field, sort) {
  if (field === sort.field) {
    return sort.type === "-" ? "<i class='sort-down'></i>" : "<i class='sort-up'></i>"
  }
  return et
}
exports.renderSort = renderSort
function buildSortSearch(search, fields, sortStr) {
  var sort = buildSort(sortStr)
  search = removeSort(search)
  var sorts = {}
  var prefix = search.length > 0 ? "?" + search + "&" : "?"
  for (var i = 0; i < fields.length; i++) {
    sorts[fields[i]] = {
      url: prefix + resources_1.resources.sort + "=" + getSortString(fields[i], sort),
      tag: renderSort(fields[i], sort),
    }
  }
  return sorts
}
exports.buildSortSearch = buildSortSearch
function clone(obj) {
  if (!obj) {
    return obj
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  if (typeof obj !== "object") {
    return obj
  }
  if (Array.isArray(obj)) {
    var arr = []
    for (var _i = 0, obj_1 = obj; _i < obj_1.length; _i++) {
      var sub = obj_1[_i]
      var c = clone(sub)
      arr.push(c)
    }
    return arr
  }
  var x = {}
  var keys = Object.keys(obj)
  for (var _a = 0, keys_1 = keys; _a < keys_1.length; _a++) {
    var k = keys_1[_a]
    var v = obj[k]
    if (v instanceof Date) {
      x[k] = new Date(v.getTime())
    } else {
      switch (typeof v) {
        case "object":
          x[k] = clone(v)
          break
        default:
          x[k] = v
          break
      }
    }
  }
  return x
}
exports.clone = clone
function cloneFilter(obj, limit, page) {
  var f = clone(obj)
  if (!obj.hasOwnProperty(resources_1.resources.page)) {
    obj[resources_1.resources.page] = page
  }
  if (!obj.hasOwnProperty(resources_1.resources.limit)) {
    obj[resources_1.resources.limit] = limit
  }
  return f
}
exports.cloneFilter = cloneFilter
function addSequence(list, offset, name) {
  var n = name ? name : "sequence"
  var l = list.length
  for (var i = 0; i < l; i++) {
    list[i][n] = offset + i + 1
  }
  return list
}
exports.addSequence = addSequence
function jsonResult(res, result, quick, fields, config) {
  if (quick && fields && fields.length > 0) {
    res.status(200).json(toCsv(fields, result)).end()
  } else {
    res.status(200).json(buildResult(result, config)).end()
  }
}
exports.jsonResult = jsonResult
function buildResult(r, conf) {
  if (!conf) {
    return r
  }
  var x = {}
  var li = conf.list ? conf.list : "list"
  x[li] = http_1.minimizeArray(r.list)
  var to = conf.total ? conf.total : "total"
  x[to] = r.total
  if (r.nextPageToken && r.nextPageToken.length > 0) {
    var t = conf.token ? conf.token : "token"
    x[t] = r.nextPageToken
  }
  return x
}
exports.buildResult = buildResult
function initializeConfig(conf) {
  if (!conf) {
    return undefined
  }
  var c = {
    excluding: conf.excluding,
    list: conf.list,
    total: conf.total,
    token: conf.token,
    csv: conf.csv,
  }
  if (!c.excluding || c.excluding.length === 0) {
    c.excluding = "excluding"
  }
  if (!c.list || c.list.length === 0) {
    c.list = "list"
  }
  if (!c.total || c.total.length === 0) {
    c.total = "total"
  }
  if (!c.token || c.token.length === 0) {
    c.token = "nextPageToken"
  }
  return c
}
exports.initializeConfig = initializeConfig
function fromRequest(req, arr) {
  var s = req.method === "GET" ? fromUrl(req, arr) : req.body
  var page = s[resources_1.resources.page]
  if (page) {
    if (isNaN(page)) {
      s[resources_1.resources.page] = 1
    } else {
      var n = parseFloat(page)
      if (n < 1) {
        n = 1
      }
      s[resources_1.resources.page] = n
    }
  } else {
    s[resources_1.resources.page] = 1
  }
  var limit = s[resources_1.resources.limit]
  if (limit) {
    if (isNaN(limit)) {
      s[resources_1.resources.limit] = resources_1.resources.defaultLimit
    } else {
      var n = parseFloat(limit)
      if (n < 1) {
        n = resources_1.resources.defaultLimit
      }
      s[resources_1.resources.limit] = n
    }
  } else {
    s[resources_1.resources.limit] = resources_1.resources.defaultLimit
  }
  if (resources_1.resources.partial.length > 0) {
    delete s[resources_1.resources.partial]
  }
  return s
}
exports.fromRequest = fromRequest
function buildArray(arr, s0, s1, s2) {
  var r = []
  if (arr && arr.length > 0) {
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
      var a = arr_1[_i]
      r.push(a)
    }
  }
  if (s0 && s0.length > 0) {
    r.push(s0)
  }
  if (s1 && s1.length > 0) {
    r.push(s1)
  }
  if (s2 && s2.length > 0) {
    r.push(s2)
  }
  return r
}
exports.buildArray = buildArray
function fromUrl(req, arr) {
  var s = {}
  var obj = req.query
  var keys = Object.keys(obj)
  for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
    var key = keys_2[_i]
    if (inArray(key, arr)) {
      var x = obj[key].split(",")
      setValue(s, key, x)
    } else {
      setValue(s, key, obj[key])
    }
  }
  return s
}
exports.fromUrl = fromUrl
function inArray(s, arr) {
  if (!arr || arr.length === 0) {
    return false
  }
  for (var _i = 0, arr_2 = arr; _i < arr_2.length; _i++) {
    var a = arr_2[_i]
    if (s === a) {
      return true
    }
  }
  return false
}
exports.inArray = inArray
function setValue(o, key, value) {
  var obj = o
  var replaceKey = key.replace(/\[/g, ".[").replace(/\.\./g, ".")
  if (replaceKey.indexOf(".") === 0) {
    replaceKey = replaceKey.slice(1, replaceKey.length)
  }
  var keys = replaceKey.split(".")
  var firstKey = keys.shift()
  if (!firstKey) {
    return
  }
  var isArrayKey = /\[([0-9]+)\]/.test(firstKey)
  if (keys.length > 0) {
    var firstKeyValue = obj[firstKey] || {}
    var returnValue = setValue(firstKeyValue, keys.join("."), value)
    return setKey(obj, isArrayKey, firstKey, returnValue)
  }
  return setKey(obj, isArrayKey, firstKey, value)
}
exports.setValue = setValue
var setKey = function (_object, _isArrayKey, _key, _nextValue) {
  if (_isArrayKey) {
    if (_object.length > _key) {
      _object[_key] = _nextValue
    } else {
      _object.push(_nextValue)
    }
  } else {
    _object[_key] = _nextValue
  }
  return _object
}
function getParameters(obj) {
  var o = obj
  var fields
  var fs = o[resources_1.resources.fields]
  if (fs && Array.isArray(fs)) {
    fields = fs
  }
  var nextPageToken = o[resources_1.resources.nextPageToken]
  var page = 1
  var spage = o[resources_1.resources.page]
  if (spage && typeof spage === "string") {
    if (!isNaN(spage)) {
      var ipage = Math.floor(parseFloat(spage))
      if (ipage > 1) {
        page = ipage
      }
    }
  }
  var limit = resources_1.resources.defaultLimit
  var slimit = o[resources_1.resources.limit]
  if (slimit && typeof slimit === "string") {
    if (!isNaN(slimit)) {
      var ilimit = Math.floor(parseFloat(slimit))
      if (ilimit > 0) {
        limit = ilimit
      }
    }
  }
  var r = { limit: limit, fields: fields, page: page, nextPageToken: nextPageToken, pageOrNextPageToken: page }
  if (r.nextPageToken && r.nextPageToken.length > 0) {
    r.pageOrNextPageToken = r.nextPageToken
  }
  deletePageInfo(o)
  return r
}
exports.getParameters = getParameters
function deletePageInfo(obj, arr) {
  if (!arr || arr.length === 0) {
    delete obj[resources_1.resources.fields]
    delete obj[resources_1.resources.limit]
    delete obj[resources_1.resources.page]
    if (resources_1.resources.nextPageToken && resources_1.resources.nextPageToken.length > 0) {
      delete obj[resources_1.resources.nextPageToken]
    }
    if (resources_1.resources.partial && resources_1.resources.partial.length > 0) {
      delete obj[resources_1.resources.partial]
    }
  } else {
    for (var _i = 0, arr_3 = arr; _i < arr_3.length; _i++) {
      var o = arr_3[_i]
      if (o && o.length > 0) {
        delete obj[o]
      }
    }
  }
}
exports.deletePageInfo = deletePageInfo
var re = /"/g
function toCsv(fields, r) {
  if (!r || r.list.length === 0) {
    return "0"
  } else {
    var e = ""
    var s = "string"
    var n = "number"
    var b = '""'
    var rows = []
    rows.push("" + (r.total ? r.total : "") + "," + (r.nextPageToken ? r.nextPageToken : ""))
    for (var _i = 0, _a = r.list; _i < _a.length; _i++) {
      var item = _a[_i]
      var cols = []
      for (var _b = 0, fields_1 = fields; _b < fields_1.length; _b++) {
        var name = fields_1[_b]
        var v = item[name]
        if (!v) {
          cols.push(e)
        } else {
          if (typeof v === s) {
            if (s.indexOf(",") >= 0) {
              cols.push('"' + v.replace(re, b) + '"')
            } else {
              cols.push(v)
            }
          } else if (v instanceof Date) {
            cols.push(v.toISOString())
          } else if (typeof v === n) {
            cols.push(v.toString())
          } else {
            cols.push("")
          }
        }
      }
      rows.push(cols.join(","))
    }
    return rows.join("\n")
  }
}
exports.toCsv = toCsv
function buildMetadata(attributes, includeDate) {
  var keys = Object.keys(attributes)
  var dates = []
  var numbers = []
  for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
    var key = keys_3[_i]
    var attr = attributes[key]
    if (attr.type === "number" || attr.type === "integer") {
      numbers.push(key)
    } else if (attr.type === "datetime" || (includeDate === true && attr.type === "date")) {
      dates.push(key)
    }
  }
  var m = {}
  if (dates.length > 0) {
    m.dates = dates
  }
  if (numbers.length > 0) {
    m.numbers = numbers
  }
  return m
}
exports.buildMetadata = buildMetadata
var _datereg = "/Date("
var _re = /-?\d+/
function toDate(v) {
  if (!v) {
    return null
  }
  if (v instanceof Date) {
    return v
  } else if (typeof v === "number") {
    return new Date(v)
  }
  var i = v.indexOf(_datereg)
  if (i >= 0) {
    var m = _re.exec(v)
    if (m !== null) {
      var d = parseInt(m[0], 10)
      return new Date(d)
    } else {
      return null
    }
  } else {
    if (isNaN(v)) {
      return new Date(v)
    } else {
      var d = parseInt(v, 10)
      return new Date(d)
    }
  }
}
function format(obj, dates, nums) {
  var o = obj
  if (dates && dates.length > 0) {
    for (var _i = 0, dates_1 = dates; _i < dates_1.length; _i++) {
      var s = dates_1[_i]
      var v = o[s]
      if (v) {
        if (v instanceof Date) {
          continue
        }
        if (typeof v === "string" || typeof v === "number") {
          var d = toDate(v)
          if (d) {
            if (!(d instanceof Date) || d.toString() === "Invalid Date") {
              delete o[s]
            } else {
              o[s] = d
            }
          }
        } else if (typeof v === "object") {
          var keys = Object.keys(v)
          for (var _a = 0, keys_4 = keys; _a < keys_4.length; _a++) {
            var key = keys_4[_a]
            var v2 = v[key]
            if (v2 instanceof Date) {
              continue
            }
            if (typeof v2 === "string" || typeof v2 === "number") {
              var d2 = toDate(v2)
              if (d2) {
                if (!(d2 instanceof Date) || d2.toString() === "Invalid Date") {
                  delete v[key]
                } else {
                  v[key] = d2
                }
              }
            }
          }
        }
      }
    }
  }
  if (nums && nums.length > 0) {
    for (var _b = 0, nums_1 = nums; _b < nums_1.length; _b++) {
      var s = nums_1[_b]
      var v = o[s]
      if (v) {
        if (v instanceof Date) {
          delete o[s]
          continue
        }
        if (typeof v === "number") {
          continue
        }
        if (typeof v === "string") {
          if (!isNaN(v)) {
            delete o[s]
            continue
          } else {
            var i = parseFloat(v)
            o[s] = i
          }
        } else if (typeof v === "object") {
          var keys = Object.keys(v)
          for (var _c = 0, keys_5 = keys; _c < keys_5.length; _c++) {
            var key = keys_5[_c]
            var v2 = v[key]
            if (v2 instanceof Date) {
              delete o[key]
              continue
            }
            if (typeof v2 === "number") {
              continue
            }
            if (typeof v2 === "string") {
              if (!isNaN(v2)) {
                delete v[key]
              } else {
                var i = parseFloat(v2)
                v[key] = i
              }
            }
          }
        }
      }
    }
  }
  return o
}
exports.format = format
function getMetadataFunc(viewService, dates, numbers, keys) {
  var m = { dates: dates, numbers: numbers }
  if ((m.dates && m.dates.length > 0) || (m.numbers && m.numbers.length > 0)) {
    return m
  }
  if (keys) {
    if (!Array.isArray(keys)) {
      return buildMetadata(keys)
    }
  }
  if (typeof viewService !== "function" && viewService.metadata) {
    var metadata = viewService.metadata()
    if (metadata) {
      return buildMetadata(metadata)
    }
  }
  return undefined
}
exports.getMetadataFunc = getMetadataFunc
