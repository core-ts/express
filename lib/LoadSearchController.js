"use strict";
var __extends = (this && this.__extends) || (function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
  };
  return function (d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("./http");
var LoadController_1 = require("./LoadController");
var search_1 = require("./search");
var search_func_1 = require("./search_func");
var LoadSearchController = (function (_super) {
  __extends(LoadSearchController, _super);
  function LoadSearchController(log, find, viewService, keys, config, dates, numbers) {
    var _this = _super.call(this, log, viewService, keys) || this;
    _this.find = find;
    _this.search = _this.search.bind(_this);
    if (config) {
      if (typeof config === 'boolean') {
        _this.csv = config;
      }
      else {
        _this.config = search_1.initializeConfig(config);
        if (_this.config) {
          _this.csv = _this.config.csv;
          _this.fields = _this.config.fields;
          _this.excluding = _this.config.excluding;
        }
      }
    }
    if (!_this.fields || _this.fields.length === 0) {
      _this.fields = 'fields';
    }
    var m = search_func_1.getMetadataFunc(viewService, dates, numbers, keys);
    if (m) {
      _this.dates = m.dates;
      _this.numbers = m.numbers;
    }
    return _this;
  }
  LoadSearchController.prototype.search = function (req, res) {
    var _this = this;
    var s = search_1.fromRequest(req, this.fields, this.excluding);
    var l = search_1.getParameters(s, this.config);
    var s2 = search_1.format(s, this.dates, this.numbers);
    this.find(s2, l.limit, l.skipOrRefId, l.fields)
      .then(function (result) { return search_1.jsonResult(res, result, _this.csv, l.fields, _this.config); })
      .catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  return LoadSearchController;
}(LoadController_1.LoadController));
exports.LoadSearchController = LoadSearchController;
