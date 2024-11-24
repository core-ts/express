'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var http_1 = require('./http');
var search_1 = require('./search');
var SearchController = (function () {
  function SearchController(log, find, config, dates, numbers) {
    this.log = log;
    this.find = find;
    this.dates = dates;
    this.numbers = numbers;
    this.search = this.search.bind(this);
    if (config) {
      if (typeof config === 'boolean') {
        this.csv = config;
      } else {
        this.config = search_1.initializeConfig(config);
        if (this.config) {
          this.csv = this.config.csv;
          this.fields = this.config.fields;
          this.excluding = this.config.excluding;
        }
      }
    }
    if (!this.fields || this.fields.length === 0) {
      this.fields = 'fields';
    }
  }
  SearchController.prototype.search = function (req, res) {
    var _this = this;
    var s = search_1.fromRequest(req, search_1.buildArray(this.array, this.fields, this.excluding));
    var l = search_1.getParameters(s, this.config);
    var s2 = search_1.format(s, this.dates, this.numbers);
    this.find(s2, l.limit, l.pageOrNextPageToken, l.fields)
      .then(function (result) {
        return search_1.jsonResult(res, result, _this.csv, l.fields, _this.config);
      })
      .catch(function (err) {
        return http_1.handleError(err, res, _this.log);
      });
  };
  return SearchController;
})();
exports.SearchController = SearchController;
