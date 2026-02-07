"use strict"
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p]
}
Object.defineProperty(exports, "__esModule", { value: true })
var GenericController_1 = require("./GenericController")
exports.GenericHandler = GenericController_1.GenericController
var GenericSearchController_1 = require("./GenericSearchController")
exports.GenericSearchHandler = GenericSearchController_1.GenericSearchController
var HealthController_1 = require("./HealthController")
exports.HealthHandler = HealthController_1.HealthController
var http_1 = require("./http")
var LoadController_1 = require("./LoadController")
exports.LoadHandler = LoadController_1.LoadController
exports.ViewHandler = LoadController_1.LoadController
var LoadSearchController_1 = require("./LoadSearchController")
exports.LoadSearchHandler = LoadSearchController_1.LoadSearchController
var LogController_1 = require("./LogController")
exports.LogHandler = LogController_1.LogController
var LowCodeController_1 = require("./LowCodeController")
exports.Handler = LowCodeController_1.Controller
var resources_1 = require("./resources")
var SearchController_1 = require("./SearchController")
exports.SearchHandler = SearchController_1.SearchController
__export(require("./access"))
__export(require("./client"))
__export(require("./edit"))
__export(require("./GenericController"))
__export(require("./GenericSearchController"))
__export(require("./health"))
__export(require("./HealthController"))
__export(require("./http"))
__export(require("./LoadController"))
__export(require("./LoadSearchController"))
__export(require("./log"))
__export(require("./LogController"))
__export(require("./LowCodeController"))
__export(require("./resources"))
__export(require("./search"))
__export(require("./SearchController"))
__export(require("./view"))
var SavedController = (function () {
  function SavedController(savedService, log, id, userId) {
    this.savedService = savedService
    this.log = log
    this.userId = userId && userId.length > 0 ? userId : "userId"
    this.id = id && id.length > 0 ? id : "id"
    this.save = this.save.bind(this)
    this.remove = this.remove.bind(this)
  }
  SavedController.prototype.save = function (req, res) {
    var userId = res.locals[this.userId]
    var id = req.params[this.id]
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty")
      return
    }
    if (!userId || userId.length === 0) {
      res.status(400).end("'" + this.userId + "' cannot be empty")
      return
    }
    this.savedService
      .save(userId, id)
      .then(function (result) {
        var status = result > 0 ? 200 : result === 0 ? 409 : 422
        res.status(status).json(result).end()
      })
      .catch(function (err) {
        return http_1.handleError(err, res)
      })
  }
  SavedController.prototype.remove = function (req, res) {
    var userId = res.locals[this.userId]
    var id = req.params[this.id]
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty")
      return
    }
    if (!userId || userId.length === 0) {
      res.status(400).end("'" + this.userId + "' cannot be empty")
      return
    }
    this.savedService
      .remove(userId, id)
      .then(function (result) {
        var status = result > 0 ? 200 : 410
        res.status(status).json(result).end()
      })
      .catch(function (err) {
        return http_1.handleError(err, res)
      })
  }
  return SavedController
})()
exports.SavedController = SavedController
var FollowController = (function () {
  function FollowController(service, log, id, userId) {
    this.service = service
    this.log = log
    this.userId = userId && userId.length > 0 ? userId : "userId"
    this.id = id && id.length > 0 ? id : "id"
    this.follow = this.follow.bind(this)
    this.unfollow = this.unfollow.bind(this)
  }
  FollowController.prototype.follow = function (req, res) {
    var userId = res.locals[this.userId]
    var id = req.params[this.id]
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty")
      return
    }
    if (!userId || userId.length === 0) {
      res.status(400).end("'" + this.userId + "' cannot be empty")
      return
    }
    this.service
      .follow(userId, id)
      .then(function (result) {
        var status = result > 0 ? 200 : 409
        res.status(status).json(result).end()
      })
      .catch(function (err) {
        return http_1.handleError(err, res)
      })
  }
  FollowController.prototype.unfollow = function (req, res) {
    var userId = res.locals[this.userId]
    var id = req.params[this.id]
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty")
      return
    }
    if (!userId || userId.length === 0) {
      res.status(400).end("'" + this.userId + "' cannot be empty")
      return
    }
    this.service
      .unfollow(userId, id)
      .then(function (result) {
        var status = result > 0 ? 200 : 410
        res.status(status).json(result).end()
      })
      .catch(function (err) {
        return http_1.handleError(err, res)
      })
  }
  return FollowController
})()
exports.FollowController = FollowController
var UserReactionController = (function () {
  function UserReactionController(log, service, author, id, reaction) {
    this.log = log
    this.service = service
    this.author = author
    this.reaction = reaction
    this.id = id && id.length > 0 ? id : "id"
    this.react = this.react.bind(this)
    this.unreact = this.unreact.bind(this)
    this.checkReaction = this.checkReaction.bind(this)
  }
  UserReactionController.prototype.react = function (req, res) {
    var id = req.params.id
    var author = req.params.author
    var reaction = req.params.reaction
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty")
      return
    }
    if (!author || author.length === 0) {
      res.status(400).end("'" + this.author + "' cannot be empty")
      return
    }
    if (!reaction || reaction.length === 0) {
      res.status(400).end("'" + this.reaction + "' cannot be empty")
      return
    }
    this.service
      .react(id, author, reaction)
      .then(function (count) {
        res.status(200).json(count).end()
      })
      .catch(function (err) {
        return http_1.handleError(err, res)
      })
  }
  UserReactionController.prototype.unreact = function (req, res) {
    var id = req.params.id
    var author = req.params.author
    var reaction = req.params.reaction
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty")
      return
    }
    if (!author || author.length === 0) {
      res.status(400).end("'" + this.author + "' cannot be empty")
      return
    }
    if (!reaction || reaction.length === 0) {
      res.status(400).end("'" + this.reaction + "' cannot be empty")
      return
    }
    this.service
      .unreact(id, author, reaction)
      .then(function (count) {
        res.status(200).json(count).end()
      })
      .catch(function (err) {
        return http_1.handleError(err, res)
      })
  }
  UserReactionController.prototype.checkReaction = function (req, res) {
    var id = req.params.id
    var author = req.params.author
    if (!id || id.length === 0) {
      res.status(400).end("'" + this.id + "' cannot be empty")
      return
    }
    if (!author || author.length === 0) {
      res.status(400).end("'" + this.author + "' cannot be empty")
      return
    }
    this.service
      .checkReaction(id, author)
      .then(function (count) {
        res.status(200).json(count).end()
      })
      .catch(function (err) {
        return http_1.handleError(err, res)
      })
  }
  return UserReactionController
})()
exports.UserReactionController = UserReactionController
exports.ReactController = UserReactionController
exports.ReactionController = UserReactionController
function checked(s, v) {
  if (s) {
    if (Array.isArray(s)) {
      return s.includes(v)
    } else {
      return s === v
    }
  }
  return false
}
exports.checked = checked
function addSeconds(date, number) {
  var d = new Date(date)
  d.setSeconds(d.getSeconds() + number)
  return d
}
exports.addSeconds = addSeconds
function addMinutes(date, number) {
  var d = new Date(date)
  d.setMinutes(d.getMinutes() + number)
  return d
}
exports.addMinutes = addMinutes
function addDays(d, n) {
  var newDate = new Date(d)
  newDate.setDate(newDate.getDate() + n)
  return newDate
}
exports.addDays = addDays
function toMap(errors) {
  var errorMap = {}
  if (!errors) {
    return errorMap
  }
  for (var i = 0; i < errors.length; i++) {
    errors[i].invalid = "invalid"
    errorMap[errors[i].field] = errors[i]
  }
  return errorMap
}
exports.toMap = toMap
function isSuccessful(res) {
  return (typeof res === "number" && res <= 0) || Array.isArray(res) ? false : true
}
exports.isSuccessful = isSuccessful
function afterCreated(res, result, returnObject) {
  if (Array.isArray(result)) {
    res.status(422).json(result).end()
  } else if (typeof result === "number") {
    if (result > 0) {
      res.status(200).json(result).end()
    } else {
      res.status(409).json(result).end()
    }
  } else {
    res
      .status(201)
      .json(returnObject ? result : 1)
      .end()
  }
}
exports.afterCreated = afterCreated
function respond(res, result, returnObject) {
  if (Array.isArray(result)) {
    res.status(422).json(result).end()
  } else if (typeof result === "number") {
    if (result > 0) {
      res.status(200).json(result).end()
    } else if (result === 0) {
      res.status(410).json(result).end()
    } else {
      res.status(409).json(result).end()
    }
  } else {
    res
      .status(200)
      .json(returnObject ? result : 1)
      .end()
  }
}
exports.respond = respond
function save(isEdit, res, obj, service, returnNumber) {
  if (!isEdit) {
    service
      .create(obj)
      .then(function (result) {
        if (Array.isArray(result)) {
          res.status(422).json(result).end()
        } else if (typeof result === "number" && result <= 0) {
          res.status(409).json(result).end()
        } else {
          res.status(201).json(obj).end()
        }
      })
      .catch(function (err) {
        return http_1.handleError(err, res)
      })
  } else {
    service
      .update(obj)
      .then(function (result) {
        if (result === 0) {
          res.status(410).end()
        } else if (Array.isArray(result)) {
          res.status(422).json(result).end()
        } else if (typeof result === "number" && result < 0) {
          res.status(409).json(result).end()
        } else {
          res
            .status(200)
            .json(returnNumber ? result : obj)
            .end()
        }
      })
      .catch(function (err) {
        return http_1.handleError(err, res)
      })
  }
}
exports.save = save
var map = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
}
function escapeHTML(input) {
  return input.replace(/[&<>"'`]/g, function (char) {
    return map[char]
  })
}
exports.escapeHTML = escapeHTML
function generateChip(value, text, noClose, hasStar) {
  var s = noClose ? "" : '<span class="close" onclick="removeChip(event)"></span>'
  var t = hasStar ? '<i class="star highlight"></i>' : ""
  return '<div class="chip" data-value="' + escapeHTML(value) + '">' + escapeHTML(text) + t + s + "</div>"
}
exports.generateChip = generateChip
function generateTags(v, noClose) {
  return !v
    ? ""
    : "" +
        v
          .map(function (s) {
            return generateChip(s, s, noClose)
          })
          .join("")
}
exports.generateTags = generateTags
function generateChips(v, noClose) {
  return !v
    ? ""
    : "" +
        v
          .map(function (s) {
            return generateChip(s.value, s.text, noClose)
          })
          .join("")
}
exports.generateChips = generateChips
function generateStarChips(v, value, text, star, noClose) {
  return !v
    ? ""
    : "" +
        v
          .map(function (s) {
            return generateChip(s[value], s[text], noClose, s[star] === true)
          })
          .join("")
}
exports.generateStarChips = generateStarChips
var s = "string"
var o = "object"
function escape(obj) {
  if (!obj || typeof obj !== s) {
    return obj
  }
  var keys = Object.keys(obj)
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i]
    var v = obj[key]
    if (typeof v === s) {
      obj[key] = escapeHTML(v)
    } else if (Array.isArray(v) && v.length > 0) {
      var v1 = v[0]
      if (typeof v1 === o && !(v1 instanceof Date)) {
        for (var _a = 0, v_1 = v; _a < v_1.length; _a++) {
          var item = v_1[_a]
          escape(item)
        }
      }
    } else if (typeof v === o && !(v instanceof Date)) {
      escape(obj[key])
    }
  }
  return obj
}
exports.escape = escape
function escapeArray(arrs, offset, name) {
  if (offset === void 0) {
    offset = 0
  }
  if (!arrs) {
    return arrs
  }
  if (arrs.length > 0) {
    for (var _i = 0, arrs_1 = arrs; _i < arrs_1.length; _i++) {
      var obj = arrs_1[_i]
      escape(obj)
    }
  }
  if (name) {
    var l = arrs.length
    for (var i = 0; i < l; i++) {
      arrs[i][name] = offset + i + 1
    }
  }
  return arrs
}
exports.escapeArray = escapeArray
function buildError404(resource, res) {
  return {
    message: {
      title: resource.error_404_title,
      description: resource.error_404_message,
    },
    menu: res.locals.menu,
  }
}
exports.buildError404 = buildError404
function buildError500(resource, res) {
  return {
    message: {
      title: resource.error_500_title,
      description: resource.error_500_message,
    },
    menu: res.locals.menu,
  }
}
exports.buildError500 = buildError500
function buildError(res, title, description) {
  return {
    message: {
      title: title,
      description: description,
    },
    menu: res.locals.menu,
  }
}
exports.buildError = buildError
function queryLang(req) {
  var lang = http_1.query(req, resources_1.resources.languageParam)
  return lang && lang.length > 0 ? lang : resources_1.resources.defaultLanguage
}
exports.queryLang = queryLang
