"use strict"
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b
          }) ||
        function (d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
        }
      return extendStatics(d, b)
    }
    return function (d, b) {
      extendStatics(d, b)
      function __() {
        this.constructor = d
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
    }
  })()
Object.defineProperty(exports, "__esModule", { value: true })
var GenericController_1 = require("./GenericController")
var http_1 = require("./http")
var resources_1 = require("./resources")
var search_1 = require("./search")
var GenericSearchController = (function (_super) {
  __extends(GenericSearchController, _super)
  function GenericSearchController(log, find, service, config, build, validate, dates, numbers) {
    var _this = _super.call(this, log, service, build, validate) || this
    _this.find = find
    _this.search = _this.search.bind(_this)
    _this.config = search_1.initializeConfig(config)
    if (_this.config) {
      _this.csv = _this.config.csv
      _this.excluding = _this.config.excluding
    }
    var m = search_1.getMetadataFunc(service, dates, numbers)
    if (m) {
      _this.dates = m.dates
      _this.numbers = m.numbers
    }
    return _this
  }
  GenericSearchController.prototype.search = function (req, res) {
    var _this = this
    var s = search_1.fromRequest(req, search_1.buildArray(this.array, resources_1.resources.fields, this.excluding))
    var l = search_1.getParameters(s, this.config)
    var s2 = search_1.format(s, this.dates, this.numbers)
    this.find(s2, l.limit, l.pageOrNextPageToken, l.fields)
      .then(function (result) {
        return search_1.jsonResult(res, result, _this.csv, l.fields, _this.config)
      })
      .catch(function (err) {
        return http_1.handleError(err, res, _this.log)
      })
  }
  return GenericSearchController
})(GenericController_1.GenericController)
exports.GenericSearchController = GenericSearchController
