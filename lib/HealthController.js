"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var health_1 = require("./health")
var HealthController = (function () {
  function HealthController(checkers) {
    this.checkers = checkers
    this.check = this.check.bind(this)
  }
  HealthController.prototype.check = function (req, res) {
    health_1.health(this.checkers).then(function (r) {
      if (r.status === "UP") {
        res.status(200).json(r).end()
      } else {
        res.status(500).json(r).end()
      }
    })
  }
  return HealthController
})()
exports.HealthController = HealthController
