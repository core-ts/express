"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var resources = (function () {
  function resources() {
  }
  return resources;
}());
exports.resources = resources;
var TypeChecker = (function () {
  function TypeChecker(attributes, allowUndefined) {
    this.attributes = attributes;
    this.allowUndefined = allowUndefined;
    this.check = this.check.bind(this);
  }
  TypeChecker.prototype.check = function (req, res, next) {
    var obj = req.body;
    if (!obj || obj === '') {
      return res.status(400).end('The request body cannot be empty');
    }
    else {
      var errors = resources.check(obj, this.attributes, this.allowUndefined);
      if (errors.length > 0) {
        res.status(400).json(errors).end();
      }
      else {
        next();
      }
    }
  };
  return TypeChecker;
}());
exports.TypeChecker = TypeChecker;
function check(attributes, allowUndefined) {
  var x = new TypeChecker(attributes, allowUndefined);
  return x.check;
}
exports.check = check;
