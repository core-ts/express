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
var edit_1 = require("./edit");
var LoadController_1 = require("./LoadController");
var resources_1 = require("./resources");
var response_1 = require("./response");
var view_1 = require("./view");
var GenericController = (function (_super) {
  __extends(GenericController, _super);
  function GenericController(log, service, status, validate) {
    var _this = _super.call(this, log, service) || this;
    _this.service = service;
    _this.validate = validate;
    _this.status = edit_1.initializeStatus(status);
    if (service.metadata) {
      var m = service.metadata();
      if (m) {
        _this.metadata = m.attributes;
      }
    }
    _this.insert = _this.insert.bind(_this);
    _this.update = _this.update.bind(_this);
    _this.patch = _this.patch.bind(_this);
    _this.delete = _this.delete.bind(_this);
    if (!validate && resources_1.resources.createValidator && _this.metadata) {
      var v = resources_1.resources.createValidator(_this.metadata);
      _this.validate = v.validate;
    }
    return _this;
  }
  GenericController.prototype.insert = function (req, res) {
    var _this = this;
    var obj = req.body;
    if (!obj) {
      return res.status(400).end('The request body cannot be empty.');
    }
    if (this.validate) {
      var l_1 = this.log;
      this.validate(obj).then(function (errors) {
        if (errors && errors.length > 0) {
          var r = { status: _this.status.validation_error, errors: errors };
          res.status(getStatusCode(errors)).json(r);
        }
        else {
          edit_1.create(res, _this.status, obj, _this.service.insert, _this.log);
        }
      }).catch(function (err) { return response_1.handleError(err, res, l_1); });
    }
    else {
      edit_1.create(res, this.status, obj, this.service.insert, this.log);
    }
  };
  GenericController.prototype.update = function (req, res) {
    var _this = this;
    var obj = req.body;
    if (!obj) {
      return res.status(400).end('The request body cannot be empty.');
    }
    var id = view_1.buildId(req, this.keys);
    if (!id) {
      return res.status(400).end('Invalid parameters');
    }
    var ok = edit_1.checkId(obj, id, this.keys);
    if (!ok) {
      return res.status(400).end('Invalid parameters');
    }
    if (this.validate) {
      var l_2 = this.log;
      this.validate(obj).then(function (errors) {
        if (errors && errors.length > 0) {
          var r = { status: _this.status.validation_error, errors: errors };
          res.status(getStatusCode(errors)).json(r);
        }
        else {
          edit_1.update(res, _this.status, obj, _this.service.update, _this.log);
        }
      }).catch(function (err) { return response_1.handleError(err, res, l_2); });
    }
    else {
      edit_1.update(res, this.status, obj, this.service.update, this.log);
    }
  };
  GenericController.prototype.patch = function (req, res) {
    var _this = this;
    var obj = req.body;
    if (!obj) {
      return res.status(400).end('The request body cannot be empty.');
    }
    var id = view_1.buildId(req, this.keys);
    if (!id) {
      return res.status(400).end('Invalid parameters');
    }
    var ok = edit_1.checkId(obj, id, this.keys);
    if (!ok) {
      return res.status(400).end('Invalid parameters');
    }
    if (this.validate) {
      var l_3 = this.log;
      this.validate(obj, true).then(function (errors) {
        if (errors && errors.length > 0) {
          var r = { status: _this.status.validation_error, errors: errors };
          res.status(getStatusCode(errors)).json(r);
        }
        else {
          edit_1.update(res, _this.status, obj, _this.service.patch, _this.log);
        }
      }).catch(function (err) { return response_1.handleError(err, res, l_3); });
    }
    else {
      edit_1.update(res, this.status, obj, this.service.update, this.log);
    }
  };
  GenericController.prototype.delete = function (req, res) {
    var _this = this;
    var id = view_1.buildId(req, this.keys);
    if (!id) {
      return res.status(400).end('invalid parameters');
    }
    this.service.delete(id).then(function (count) {
      if (count > 0) {
        res.status(200).json(count);
      }
      else if (count === 0) {
        res.status(404).json(count);
      }
      else {
        res.status(409).json(count);
      }
    }).catch(function (err) {
      if (_this.log) {
        _this.log(err);
      }
      res.status(500).end('Internal Server Error');
    });
  };
  return GenericController;
}(LoadController_1.LoadController));
exports.GenericController = GenericController;
function getStatusCode(errs) {
  return (edit_1.isTypeError(errs) ? 400 : 422);
}
