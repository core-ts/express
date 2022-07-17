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
var GenericController_1 = require("./GenericController");
var http_1 = require("./http");
var search_1 = require("./search");
var search_func_1 = require("./search_func");
var LowcodeController = (function (_super) {
  __extends(LowcodeController, _super);
  function LowcodeController(log, lowCodeService, config, build, validate, dates, numbers) {
    var _this = _super.call(this, log, lowCodeService, config, build, validate) || this;
    _this.lowCodeService = lowCodeService;
    _this.search = _this.search.bind(_this);
    _this.config = search_1.initializeConfig(config);
    if (_this.config) {
      _this.csv = _this.config.csv;
      _this.fields = _this.config.fields;
      _this.excluding = _this.config.excluding;
    }
    if (!_this.fields || _this.fields.length === 0) {
      _this.fields = 'fields';
    }
    var m = search_func_1.getMetadataFunc(lowCodeService, dates, numbers);
    if (m) {
      _this.dates = m.dates;
      _this.numbers = m.numbers;
    }
    return _this;
  }
  LowcodeController.prototype.search = function (req, res) {
    var _this = this;
    var s = search_1.fromRequest(req, search_1.buildArray(this.array, this.fields, this.excluding));
    var l = search_1.getParameters(s, this.config);
    var s2 = search_1.format(s, this.dates, this.numbers);
    this.lowCodeService.search(s2, l.limit, l.skipOrRefId, l.fields)
      .then(function (result) { return search_1.jsonResult(res, result, _this.csv, l.fields, _this.config); })
      .catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  return LowcodeController;
}(GenericController_1.GenericController));
exports.LowcodeController = LowcodeController;
var Controller = (function (_super) {
  __extends(Controller, _super);
  function Controller(log, lowCodeService, build, validate, config, dates, numbers) {
    var _this = _super.call(this, log, lowCodeService, config, build, validate) || this;
    _this.lowCodeService = lowCodeService;
    _this.search = _this.search.bind(_this);
    _this.config = search_1.initializeConfig(config);
    if (_this.config) {
      _this.csv = _this.config.csv;
      _this.fields = _this.config.fields;
      _this.excluding = _this.config.excluding;
    }
    if (!_this.fields || _this.fields.length === 0) {
      _this.fields = 'fields';
    }
    var m = search_func_1.getMetadataFunc(lowCodeService, dates, numbers);
    if (m) {
      _this.dates = m.dates;
      _this.numbers = m.numbers;
    }
    return _this;
  }
  Controller.prototype.search = function (req, res) {
    var _this = this;
    var s = search_1.fromRequest(req, search_1.buildArray(this.array, this.fields, this.excluding));
    var l = search_1.getParameters(s, this.config);
    var s2 = search_1.format(s, this.dates, this.numbers);
    this.lowCodeService.search(s2, l.limit, l.skipOrRefId, l.fields)
      .then(function (result) { return search_1.jsonResult(res, result, _this.csv, l.fields, _this.config); })
      .catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  return Controller;
}(GenericController_1.GenericController));
exports.Controller = Controller;
