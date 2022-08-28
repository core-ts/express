"use strict";
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var GenericController_1 = require("./GenericController");
exports.GenericHandler = GenericController_1.GenericController;
var GenericSearchController_1 = require("./GenericSearchController");
exports.GenericSearchHandler = GenericSearchController_1.GenericSearchController;
var HealthController_1 = require("./HealthController");
exports.HealthHandler = HealthController_1.HealthController;
var http_1 = require("./http");
var LoadController_1 = require("./LoadController");
exports.LoadHandler = LoadController_1.LoadController;
exports.ViewHandler = LoadController_1.LoadController;
var LoadSearchController_1 = require("./LoadSearchController");
exports.LoadSearchHandler = LoadSearchController_1.LoadSearchController;
var LogController_1 = require("./LogController");
exports.LogHandler = LogController_1.LogController;
var LowCodeController_1 = require("./LowCodeController");
exports.Handler = LowCodeController_1.Controller;
var SearchController_1 = require("./SearchController");
exports.SearchHandler = SearchController_1.SearchController;
__export(require("./health"));
__export(require("./client"));
__export(require("./HealthController"));
__export(require("./LogController"));
__export(require("./log"));
__export(require("./http"));
__export(require("./view"));
__export(require("./LoadController"));
__export(require("./search_func"));
__export(require("./search"));
__export(require("./SearchController"));
__export(require("./LoadSearchController"));
__export(require("./resources"));
__export(require("./edit"));
__export(require("./GenericController"));
__export(require("./GenericSearchController"));
__export(require("./LowCodeController"));
function allow(access) {
  var ao = access.origin;
  if (typeof ao === 'string') {
    return function (req, res, next) {
      res.header('Access-Control-Allow-Origin', access.origin);
      res.header('Access-Control-Allow-Credentials', access.credentials);
      res.header('Access-Control-Allow-Methods', access.methods);
      res.setHeader('Access-Control-Allow-Headers', access.headers);
      next();
    };
  }
  else if (Array.isArray(ao) && ao.length > 0) {
    return function (req, res, next) {
      var origin = req.headers.origin;
      if (origin) {
        if (ao.includes(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
        }
      }
      res.header('Access-Control-Allow-Credentials', access.credentials);
      res.header('Access-Control-Allow-Methods', access.methods);
      res.setHeader('Access-Control-Allow-Headers', access.headers);
      next();
    };
  }
  return function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', access.credentials);
    res.header('Access-Control-Allow-Methods', access.methods);
    res.setHeader('Access-Control-Allow-Headers', access.headers);
    next();
  };
}
exports.allow = allow;
var SavedController = (function () {
  function SavedController(log, service, item, id) {
    this.log = log;
    this.service = service;
    this.item = item;
    this.id = (id && id.length > 0 ? id : 'id');
    this.save = this.save.bind(this);
    this.remove = this.remove.bind(this);
    this.load = this.load.bind(this);
  }
  SavedController.prototype.save = function (req, res) {
    var _this = this;
    var id = req.params[this.id];
    var itemId = req.params[this.item];
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty");
      return;
    }
    if (!itemId || itemId.length === 0) {
      res.status(400).end("'" + this.item + "' cannot be empty");
      return;
    }
    this.service.save(id, itemId).then(function (data) {
      res.status(200).json(data).end();
    })
      .catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  SavedController.prototype.remove = function (req, res) {
    var _this = this;
    var id = req.params[this.id];
    var itemId = req.params[this.item];
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty");
      return;
    }
    if (!itemId || itemId.length === 0) {
      res.status(400).end("'" + this.item + "' cannot be empty");
      return;
    }
    this.service.remove(id, itemId).then(function (data) {
      res.status(200).json(data).end();
    })
      .catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  SavedController.prototype.load = function (req, res) {
    var _this = this;
    var id = req.params[this.id];
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty");
      return;
    }
    this.service.load(id).then(function (data) {
      res.status(200).json(data).send();
    })
      .catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  return SavedController;
}());
exports.SavedController = SavedController;
var FollowController = (function () {
  function FollowController(log, service, target, id) {
    this.log = log;
    this.service = service;
    this.target = target;
    this.id = (id && id.length > 0 ? id : 'id');
    this.follow = this.follow.bind(this);
    this.unfollow = this.unfollow.bind(this);
    this.checkFollow = this.checkFollow.bind(this);
  }
  FollowController.prototype.follow = function (req, res) {
    var _this = this;
    var id = req.params.id;
    var target = req.params.target;
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty");
      return;
    }
    if (!target || target.length === 0) {
      res.status(400).end("'" + this.target + "' cannot be empty");
      return;
    }
    this.service.follow(id, target).then(function (count) {
      return res.status(200).json(count).end();
    }).catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  FollowController.prototype.unfollow = function (req, res) {
    var _this = this;
    var id = req.params.id;
    var target = req.params.target;
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty");
      return;
    }
    if (!target || target.length === 0) {
      res.status(400).end("'" + this.target + "' cannot be empty");
      return;
    }
    this.service.unfollow(id, target).then(function (count) {
      return res.status(200).json(count).end();
    }).catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  FollowController.prototype.checkFollow = function (req, res) {
    var _this = this;
    var id = req.params.id;
    var target = req.params.target;
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty");
      return;
    }
    if (!target || target.length === 0) {
      res.status(400).end("'" + this.target + "' cannot be empty");
      return;
    }
    this.service.checkFollow(id, target).then(function (count) {
      return res.status(200).json(count).end();
    }).catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  return FollowController;
}());
exports.FollowController = FollowController;
var ReactionController = (function () {
  function ReactionController(log, service, author, id, reaction) {
    this.log = log;
    this.service = service;
    this.author = author;
    this.reaction = reaction;
    this.id = (id && id.length > 0 ? id : 'id');
    this.react = this.react.bind(this);
    this.unreact = this.unreact.bind(this);
    this.checkReaction = this.checkReaction.bind(this);
  }
  ReactionController.prototype.react = function (req, res) {
    var _this = this;
    var id = req.params.id;
    var author = req.params.author;
    var reaction = req.params.reaction;
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty");
      return;
    }
    if (!author || author.length === 0) {
      res.status(400).end("'" + this.author + "' cannot be empty");
      return;
    }
    if (!reaction || reaction.length === 0) {
      res.status(400).end("'" + this.reaction + "' cannot be empty");
      return;
    }
    this.service.react(id, author, reaction).then(function (count) {
      return res.status(200).json(count).end();
    }).catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  ReactionController.prototype.unreact = function (req, res) {
    var _this = this;
    var id = req.params.id;
    var author = req.params.author;
    var reaction = req.params.reaction;
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty");
      return;
    }
    if (!author || author.length === 0) {
      res.status(400).end("'" + this.author + "' cannot be empty");
      return;
    }
    if (!reaction || reaction.length === 0) {
      res.status(400).end("'" + this.reaction + "' cannot be empty");
      return;
    }
    this.service.unreact(id, author, reaction).then(function (count) {
      return res.status(200).json(count).end();
    }).catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  ReactionController.prototype.checkReaction = function (req, res) {
    var _this = this;
    var id = req.params.id;
    var author = req.params.author;
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty");
      return;
    }
    if (!author || author.length === 0) {
      res.status(400).end("'" + this.author + "' cannot be empty");
      return;
    }
    this.service.checkReaction(id, author).then(function (count) {
      return res.status(200).json(count).end();
    }).catch(function (err) { return http_1.handleError(err, res, _this.log); });
  };
  return ReactionController;
}());
exports.ReactionController = ReactionController;
exports.ReactController = ReactionController;
exports.UserReactionController = ReactionController;
