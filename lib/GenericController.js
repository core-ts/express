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
var http_1 = require("./http");
var LoadController_1 = require("./LoadController");
var resources_1 = require("./resources");
var view_1 = require("./view");
var GenericController = (function (_super) {
  __extends(GenericController, _super);
  function GenericController(log, service, status, validate, build) {
    var _this = _super.call(this, log, service) || this;
    _this.service = service;
    _this.validate = validate;
    _this.build = build;
    _this.status = edit_1.initializeStatus(status);
    if (service.metadata) {
      var m = service.metadata();
      if (m) {
        _this.metadata = m;
      }
    }
    _this.create = _this.create.bind(_this);
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
  GenericController.prototype.create = function (req, res) {
    return this.insert(req, res);
  };
  GenericController.prototype.insert = function (req, res) {
    validateAndCreate(req, res, this.status, this.service.insert, this.log, this.validate, this.build);
  };
  GenericController.prototype.update = function (req, res) {
    var id = buildAndCheckIdWithBody(req, res, this.keys, this.service.update);
    if (id) {
      validateAndUpdate(res, this.status, req.body, false, this.service.update, this.log, this.validate, this.build);
    }
  };
  GenericController.prototype.patch = function (req, res) {
    var id = buildAndCheckIdWithBody(req, res, this.keys, this.service.patch);
    if (id && this.service.patch) {
      validateAndUpdate(res, this.status, req.body, true, this.service.patch, this.log, this.validate, this.build);
    }
  };
  GenericController.prototype.delete = function (req, res) {
    var _this = this;
    var id = view_1.buildAndCheckId(req, res, this.keys);
    if (id) {
      if (!this.service.delete) {
        res.status(405).end('Method Not Allowed');
      }
      else {
        this.service.delete(id).then(function (count) {
          res.status(getDeleteStatus(count)).json(count).end();
        }).catch(function (err) { return http_1.handleError(err, res, _this.log); });
      }
    }
  };
  return GenericController;
}(LoadController_1.LoadController));
exports.GenericController = GenericController;
function validateAndCreate(req, res, status, save, log, validate, build) {
  var obj = req.body;
  if (!obj || obj === '') {
    res.status(400).end('The request body cannot be empty.');
  }
  else {
    if (validate) {
      validate(obj).then(function (errors) {
        if (errors && errors.length > 0) {
          var r = { status: status.validation_error, errors: errors };
          res.status(getStatusCode(errors)).json(r).end();
        }
        else {
          if (build) {
            build(res, obj, true);
          }
          edit_1.create(res, status, obj, save, log);
        }
      }).catch(function (err) { return http_1.handleError(err, res, log); });
    }
    else {
      edit_1.create(res, status, obj, save, log);
    }
  }
}
exports.validateAndCreate = validateAndCreate;
function validateAndUpdate(res, status, obj, isPatch, save, log, validate, build) {
  if (validate) {
    validate(obj, isPatch).then(function (errors) {
      if (errors && errors.length > 0) {
        var r = { status: status.validation_error, errors: errors };
        res.status(getStatusCode(errors)).json(r).end();
      }
      else {
        if (build) {
          build(res, obj, false, isPatch);
        }
        edit_1.update(res, status, obj, save, log);
      }
    }).catch(function (err) { return http_1.handleError(err, res, log); });
  }
  else {
    edit_1.update(res, status, obj, save, log);
  }
}
exports.validateAndUpdate = validateAndUpdate;
function buildAndCheckIdWithBody(req, res, keys, patch) {
  var obj = req.body;
  if (!obj || obj === '') {
    res.status(400).end('The request body cannot be empty.');
    return undefined;
  }
  if (!patch) {
    res.status(405).end('Method Not Allowed');
    return undefined;
  }
  var id = view_1.buildId(req, keys);
  if (!id) {
    res.status(400).end('Invalid parameters');
    return undefined;
  }
  var ok = edit_1.checkId(obj, id, keys);
  if (!ok) {
    res.status(400).end('body and url are not matched');
    return undefined;
  }
  return id;
}
exports.buildAndCheckIdWithBody = buildAndCheckIdWithBody;
function getDeleteStatus(count) {
  if (count > 0) {
    return 200;
  }
  else if (count === 0) {
    return 404;
  }
  else {
    return 409;
  }
}
exports.getDeleteStatus = getDeleteStatus;
function getStatusCode(errs) {
  return (edit_1.isTypeError(errs) ? 400 : 422);
}
exports.getStatusCode = getStatusCode;
function useBuild(c, generate) {
  var b = new Builder(generate, c.id ? c.id : '', c.payload ? c.payload : '', c.user ? c.user : '', c.updatedBy ? c.updatedBy : '', c.updatedAt ? c.updatedAt : '', c.createdBy ? c.createdBy : '', c.createdAt ? c.createdAt : '');
  return b.build;
}
exports.useBuild = useBuild;
var Builder = (function () {
  function Builder(generate, id, payload, user, updatedBy, updatedAt, createdBy, createdAt) {
    this.generate = generate;
    this.id = id;
    this.payload = payload;
    this.user = user;
    this.updatedBy = updatedBy;
    this.updatedAt = updatedAt;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.build = this.build.bind(this);
  }
  Builder.prototype.build = function (res, obj, isCreate, isPatch) {
    var o = obj;
    var usr = '';
    if (this.user.length > 0) {
      if (this.payload.length > 0) {
        var payload = res.locals[this.payload];
        if (payload) {
          usr = payload[this.user];
        }
      }
      else {
        usr = res.locals[this.user];
      }
    }
    if (!usr) {
      usr = '';
    }
    var now = new Date();
    if (isCreate) {
      if (this.generate && this.id.length > 0) {
        o[this.id] = this.generate();
      }
      if (usr.length > 0) {
        if (this.createdAt.length > 0) {
          o[this.createdAt] = now;
        }
        if (this.createdBy.length > 0) {
          o[this.createdBy] = usr;
        }
      }
    }
    else if (isPatch) {
      var keys = Object.keys(o);
      if (keys.length === 0) {
        return;
      }
    }
    if (usr.length > 0) {
      if (this.updatedAt.length > 0) {
        o[this.updatedAt] = now;
      }
      if (this.updatedBy.length > 0) {
        o[this.updatedBy] = usr;
      }
    }
  };
  return Builder;
}());
exports.Builder = Builder;
