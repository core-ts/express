"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var health_1 = require("./health");
var HealthController = (function () {
  function HealthController(checkers) {
    this.checkers = checkers;
    this.check = this.check.bind(this);
  }
  HealthController.prototype.check = function (req, res) {
    health_1.check(this.checkers).then(function (heath) {
      if (heath.status === 'UP') {
        return res.status(200).json(heath).end();
      }
      else {
        return res.status(500).json(heath).end();
      }
    });
  };
  return HealthController;
}());
exports.HealthController = HealthController;
