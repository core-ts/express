"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var https = require("https");
function getHealthSecure(url, timeout) {
  return new Promise(function (resolve) {
    https.get(url, { rejectUnauthorized: false }, function (res) {
      var data = '';
      res.on('data', function (d) {
        data += d;
      });
      res.on('end', function () {
        resolve({ statusCode: res.statusCode, data: data, statusMessage: res.statusMessage });
      });
    }).on('error', function (e) {
      return { statusCode: 500, statusMessage: e };
    });
    setTimeout(function () { return resolve({ statusCode: 408, statusMessage: 'Time out' }); }, timeout);
  });
}
function getHealth(url, timeout) {
  return new Promise(function (resolve) {
    http.get(url, function (res) {
      var data = '';
      res.on('data', function (d) {
        data += d;
      });
      res.on('end', function () {
        resolve({ statusCode: res.statusCode, data: data, statusMessage: res.statusMessage });
      });
    }).on('error', function (e) {
      return { statusCode: 500, statusMessage: e };
    });
    setTimeout(function () { return resolve({ statusCode: 408, statusMessage: 'Time out' }); }, timeout);
  });
}
var ClientChecker = (function () {
  function ClientChecker(service, url, timeout) {
    this.service = service;
    this.url = url;
    this.timeout = (timeout ? timeout : 4200);
    this.check = this.check.bind(this);
    this.name = this.name.bind(this);
    this.build = this.build.bind(this);
  }
  ClientChecker.prototype.check = function () {
    var obj = {};
    if (this.url.startsWith('https://')) {
      return getHealthSecure(this.url, this.timeout).then(function (r) { return obj = r; });
    }
    else {
      return getHealth(this.url, this.timeout).then(function (r) { return obj = r; });
    }
  };
  ClientChecker.prototype.name = function () {
    return this.service;
  };
  ClientChecker.prototype.build = function (data, err) {
    if (err) {
      if (!data) {
        data = {};
      }
      data['error'] = err;
    }
    return data;
  };
  return ClientChecker;
}());
exports.ClientChecker = ClientChecker;
