"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var response_1 = require("./response");
var search_1 = require("./search");
var SearchController = (function () {
  function SearchController(log, find, config, format) {
    this.log = log;
    this.find = find;
    this.format = format;
    this.search = this.search.bind(this);
    if (config) {
      if (typeof config === 'boolean') {
        this.csv = config;
      }
      else {
        this.config = search_1.initializeConfig(config);
        if (this.config) {
          this.csv = this.config.csv;
        }
      }
    }
  }
  SearchController.prototype.search = function (req, res) {
    var _this = this;
    var s = search_1.fromRequest(req, this.format);
    var l = search_1.getLimit(s);
    this.find(s, l.limit, l.skip, l.refId)
      .then(function (result) { return search_1.jsonResult(res, result, _this.csv, s.fields, _this.config); })
      .catch(function (err) { return response_1.handleError(err, res, _this.log); });
  };
  return SearchController;
}());
exports.SearchController = SearchController;
