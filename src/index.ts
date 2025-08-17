import { NextFunction, Request, Response } from "express"
import { GenericController } from "./GenericController"
import { GenericSearchController } from "./GenericSearchController"
import { HealthController } from "./HealthController"
import { handleError, Log, query } from "./http"
import { LoadController } from "./LoadController"
import { LoadSearchController } from "./LoadSearchController"
import { LogController } from "./LogController"
import { Controller, Service } from "./LowCodeController"
import { ErrorMessage } from "./metadata"
import { resources, StringMap } from "./resources"
import { SearchController } from "./SearchController"

export { HealthController as HealthHandler, LoadController as LoadHandler, LogController as LogHandler, LoadController as ViewHandler }
// export {LoadController as ViewController};

export {
  GenericController as GenericHandler,
  GenericSearchController as GenericSearchHandler,
  Controller as Handler,
  LoadSearchController as LoadSearchHandler,
  Service as LowCodeService,
  SearchController as SearchHandler,
}

export * from "./client"
export * from "./edit"
export * from "./GenericController"
export * from "./GenericSearchController"
export * from "./health"
export * from "./HealthController"
export * from "./http"
export * from "./LoadController"
export * from "./LoadSearchController"
export * from "./log"
export * from "./LogController"
export * from "./LowCodeController"
export * from "./metadata"
export * from "./resources"
export * from "./search"
export * from "./SearchController"
export * from "./view"

export interface AccessConfig {
  origin?: string | string[]
  credentials?: string | string[]
  methods?: string | string[]
  headers: number | string | ReadonlyArray<string>
}
export type AccessControlAllowConfig = AccessConfig
export function allow(access: AccessConfig): (req: Request, res: Response, next: NextFunction) => void {
  const ao = access.origin
  if (typeof ao === "string") {
    return (req: Request, res: Response, next: NextFunction) => {
      res.header("Access-Control-Allow-Origin", access.origin)
      res.header("Access-Control-Allow-Credentials", access.credentials)
      res.header("Access-Control-Allow-Methods", access.methods)
      res.setHeader("Access-Control-Allow-Headers", access.headers)
      next()
    }
  } else if (Array.isArray(ao) && ao.length > 0) {
    return (req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers.origin
      if (origin) {
        if (ao.includes(origin)) {
          res.setHeader("Access-Control-Allow-Origin", origin)
        }
      }
      res.header("Access-Control-Allow-Credentials", access.credentials)
      res.header("Access-Control-Allow-Methods", access.methods)
      res.setHeader("Access-Control-Allow-Headers", access.headers)
      next()
    }
  }
  return (req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Credentials", access.credentials)
    res.header("Access-Control-Allow-Methods", access.methods)
    res.setHeader("Access-Control-Allow-Headers", access.headers)
    next()
  }
}
export interface SavedService<T> {
  load(id: string): Promise<T[]>
  save(id: string, itemId: string): Promise<number>
  remove(id: string, itemId: string): Promise<number>
}
export class SavedController<T> {
  constructor(public log: (msg: string) => void, public service: SavedService<T>, public item: string, id?: string) {
    this.id = id && id.length > 0 ? id : "id"
    this.save = this.save.bind(this)
    this.remove = this.remove.bind(this)
    this.load = this.load.bind(this)
  }
  id: string
  save(req: Request, res: Response) {
    const id = req.params[this.id]
    const itemId = req.params[this.item]
    if (!id || id.length === 0) {
      res.status(400).end(`'${this.id}' cannot be empty`)
      return
    }
    if (!itemId || itemId.length === 0) {
      res.status(400).end(`'${this.item}' cannot be empty`)
      return
    }
    this.service
      .save(id, itemId)
      .then((data) => {
        res.status(200).json(data).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
  remove(req: Request, res: Response) {
    const id = req.params[this.id]
    const itemId = req.params[this.item]
    if (!id || id.length === 0) {
      res.status(400).end(`'${this.id}' cannot be empty`)
      return
    }
    if (!itemId || itemId.length === 0) {
      res.status(400).end(`'${this.item}' cannot be empty`)
      return
    }
    this.service
      .remove(id, itemId)
      .then((data) => {
        res.status(200).json(data).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
  load(req: Request, res: Response) {
    const id = req.params[this.id]
    if (!id || id.length === 0) {
      res.status(400).end(`'${this.id}' cannot be empty`)
      return
    }
    this.service
      .load(id)
      .then((data) => {
        res.status(200).json(data).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
}
export interface FollowService {
  follow(id: string, target: string): Promise<number | undefined>
  unfollow(id: string, target: string): Promise<number>
  checkFollow(id: string, target: string): Promise<number>
}
// tslint:disable-next-line:max-classes-per-file
export class FollowController {
  constructor(public log: Log, public service: FollowService, public target: string, id: string) {
    this.id = id && id.length > 0 ? id : "id"
    this.follow = this.follow.bind(this)
    this.unfollow = this.unfollow.bind(this)
    this.checkFollow = this.checkFollow.bind(this)
  }
  id: string
  follow(req: Request, res: Response): void {
    const id = req.params.id
    const target = req.params.target
    if (!id || id.length === 0) {
      res.status(400).end(`'${this.id}' cannot be empty`)
      return
    }
    if (!target || target.length === 0) {
      res.status(400).end(`'${this.target}' cannot be empty`)
      return
    }
    this.service
      .follow(id, target)
      .then((count) => {
        return res.status(200).json(count).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
  unfollow(req: Request, res: Response): void {
    const id = req.params.id
    const target = req.params.target
    if (!id || id.length === 0) {
      res.status(400).end(`'${this.id}' cannot be empty`)
      return
    }
    if (!target || target.length === 0) {
      res.status(400).end(`'${this.target}' cannot be empty`)
      return
    }
    this.service
      .unfollow(id, target)
      .then((count) => {
        return res.status(200).json(count).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
  checkFollow(req: Request, res: Response): void {
    const id = req.params.id
    const target = req.params.target
    if (!id || id.length === 0) {
      res.status(400).end(`'${this.id}' cannot be empty`)
      return
    }
    if (!target || target.length === 0) {
      res.status(400).end(`'${this.target}' cannot be empty`)
      return
    }
    this.service
      .checkFollow(id, target)
      .then((count) => {
        return res.status(200).json(count).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
}
export interface ReactService {
  react(id: string, author: string, reaction: string): Promise<number>
  unreact(id: string, author: string, reaction: string): Promise<number>
  checkReaction(id: string, author: string): Promise<number>
}
// tslint:disable-next-line:max-classes-per-file
export class UserReactionController {
  constructor(public log: Log, public service: ReactService, public author: string, id: string, public reaction: string) {
    this.id = id && id.length > 0 ? id : "id"
    this.react = this.react.bind(this)
    this.unreact = this.unreact.bind(this)
    this.checkReaction = this.checkReaction.bind(this)
  }
  id: string
  react(req: Request, res: Response): void {
    const id = req.params.id
    const author = req.params.author
    const reaction = req.params.reaction
    if (!id || id.length === 0) {
      res.status(400).end(`'${this.id}' cannot be empty`)
      return
    }
    if (!author || author.length === 0) {
      res.status(400).end(`'${this.author}' cannot be empty`)
      return
    }
    if (!reaction || reaction.length === 0) {
      res.status(400).end(`'${this.reaction}' cannot be empty`)
      return
    }
    this.service
      .react(id, author, reaction)
      .then((count) => {
        return res.status(200).json(count).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
  unreact(req: Request, res: Response): void {
    const id = req.params.id
    const author = req.params.author
    const reaction = req.params.reaction
    if (!id || id.length === 0) {
      res.status(400).end(`'${this.id}' cannot be empty`)
      return
    }
    if (!author || author.length === 0) {
      res.status(400).end(`'${this.author}' cannot be empty`)
      return
    }
    if (!reaction || reaction.length === 0) {
      res.status(400).end(`'${this.reaction}' cannot be empty`)
      return
    }
    this.service
      .unreact(id, author, reaction)
      .then((count) => {
        return res.status(200).json(count).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
  checkReaction(req: Request, res: Response): void {
    const id = req.params.id
    const author = req.params.author
    if (!id || id.length === 0) {
      res.status(400).end(`'${this.id}' cannot be empty`)
      return
    }
    if (!author || author.length === 0) {
      res.status(400).end(`'${this.author}' cannot be empty`)
      return
    }
    this.service
      .checkReaction(id, author)
      .then((count) => {
        return res.status(200).json(count).end()
      })
      .catch((err) => handleError(err, res, this.log))
  }
}
export const ReactController = UserReactionController
export const ReactionController = UserReactionController

export function checked(s: string[] | string | undefined, v: string): boolean | undefined {
  if (s) {
    if (Array.isArray(s)) {
      return s.includes(v)
    } else {
      return s === v
    }
  }
  return false
}
export function addSeconds(date: Date, number: number): Date {
  const d = new Date(date)
  d.setSeconds(d.getSeconds() + number)
  return d
}
export function addMinutes(date: Date, number: number): Date {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() + number)
  return d
}
export function addDays(d: Date, n: number): Date {
  const newDate = new Date(d)
  newDate.setDate(newDate.getDate() + n)
  return newDate
}
export interface ErrorMap {
  [key: string]: ErrorMessage
}
export function toMap(errors: ErrorMessage[]): ErrorMap {
  const errorMap: ErrorMap = {}
  if (!errors) {
    return errorMap
  }
  for (let i = 0; i < errors.length; i++) {
    errors[i].invalid = "invalid"
    errorMap[errors[i].field] = errors[i]
  }
  return errorMap
}

interface SaveService<T> {
  create(obj: T, ctx?: any): Promise<number | T | ErrorMessage[]>
  update(obj: T, ctx?: any): Promise<number | T | ErrorMessage[]>
}
export function save<T>(isEdit: boolean, res: Response, obj: T, service: SaveService<T>, log: (msg: string, ctx?: any) => void, returnNumber?: boolean) {
  if (!isEdit) {
    service
      .create(obj)
      .then((result) => {
        if (Array.isArray(result)) {
          res.status(422).json(result).end()
        } else if (typeof result === "number" && result <= 0) {
          res.status(409).json(result).end()
        } else {
          res.status(201).json(obj).end()
        }
      })
      .catch((err) => handleError(err, res, log))
  } else {
    service
      .update(obj)
      .then((result) => {
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
      .catch((err) => handleError(err, res, log))
  }
}
const map: StringMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
}
export function escapeHTML(input: string): string {
  return input.replace(/[&<>"'`]/g, function (char) {
    return map[char]
  })
}
export function generateChip(v: string): string {
  return `<div class="chip">${escapeHTML(v)}<span class="close" onclick="removeChip(event)"></span></div>`
}
export function generateChips(v?: string[] | null): string {
  return !v ? "" : `${v.map(generateChip).join("")}`
}

const s = "string"
const o = "object"
export function escape(obj: any): any {
  if (!obj || typeof obj !== s) {
    return obj
  }
  const keys = Object.keys(obj)
  for (const key of keys) {
    const v = obj[key]
    if (typeof v === s) {
      obj[key] = escapeHTML(v)
    } else if (Array.isArray(v) && v.length > 0) {
      const v1 = v[0]
      if (typeof v1 === o && !(v1 instanceof Date)) {
        for (const item of v) {
          escape(item)
        }
      }
    } else if (typeof v === o && !(v instanceof Date)) {
      escape(obj[key])
    }
  }
  return obj
}
export function escapeArray<T>(arrs: T[], offset: number = 0, name?: string): T[] {
  if (!arrs) {
    return arrs
  }
  if (arrs.length > 0) {
    for (const obj of arrs) {
      escape(obj)
    }
  }
  if (name) {
    const l = arrs.length
    for (let i = 0; i < l; i++) {
      ;(arrs[i] as any)[name] = offset + i + 1
    }
  }
  return arrs
}

export function buildError404(resource: StringMap, res: Response): any {
  return {
    message: {
      title: resource.error_404_title,
      description: resource.error_404_message,
    },
    menu: res.locals.menu,
  }
}
export function buildError500(resource: StringMap, res: Response): any {
  return {
    message: {
      title: resource.error_500_title,
      description: resource.error_500_message,
    },
    menu: res.locals.menu,
  }
}
export function buildError(res: Response, title: string, description: string): any {
  return {
    message: {
      title,
      description,
    },
    menu: res.locals.menu,
  }
}
export function queryLang(req: Request): string {
  const lang = query(req, resources.languageParam)
  return lang && lang.length > 0 ? lang : resources.defaultLanguage
}
